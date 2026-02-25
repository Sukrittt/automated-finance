import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text } from './src/components';
import { theme } from './src/theme';
import { createAppAuthService, type AuthSession } from './src/services/auth';
import {
  BudgetsScreen,
  DashboardScreen,
  InsightsScreen,
  OnboardingScreen,
  ReviewQueueScreen,
  SettingsScreen,
  TransactionsScreen
} from './src/screens';
import { startIngestRuntime, stopIngestRuntime } from './src/services/ingest/runtime';
import { installCrashTelemetry } from './src/services/telemetry/crash';
import { getRuntimeTelemetryReporter } from './src/services/telemetry/runtimeReporter';
import { hydrateCategoryFeedbackFromStorage } from './src/services/categorization/categoryRules';
import { loadStreakState } from './src/services/engagement/streak';
import { fetchReviewQueue } from './src/services/reviewQueue/api';
import { loadEngagementPreferences } from './src/services/engagement/preferences';
import { setFeedbackSettings } from './src/services/feedback/playful';
import { getFeatureFlagsForUser } from './src/config/featureFlags';
import { loadOrCreateDailyMissions } from './src/services/engagement/missions';
import { evaluateReminderCandidates } from './src/services/engagement/reminders';
import { loadLeaderboardProfile } from './src/services/engagement/leaderboard';

type Tab = 'home' | 'transactions' | 'review' | 'budgets' | 'insights' | 'settings';

const tabs: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'transactions', label: 'Txns' },
  { key: 'review', label: 'Review' },
  { key: 'budgets', label: 'Budgets' },
  { key: 'insights', label: 'Insights' },
  { key: 'settings', label: 'Settings' }
];

export default function App() {
  const telemetryReporter = useMemo(() => getRuntimeTelemetryReporter(), []);
  const [authService] = useState(() => createAppAuthService({ telemetryReporter }));
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [streakDays, setStreakDays] = useState(0);
  const [reviewPendingCount, setReviewPendingCount] = useState(0);
  const [featureFlags, setFeatureFlags] = useState(() =>
    getFeatureFlagsForUser()
  );
  const allowDevSkip = __DEV__;

  useEffect(() => {
    installCrashTelemetry(telemetryReporter);
  }, [telemetryReporter]);

  useEffect(() => {
    let active = true;

    const hydrateFeedbackPreferences = async () => {
      const preferences = await loadEngagementPreferences();
      if (!active) {
        return;
      }
      setFeedbackSettings({
        reduceMotion: preferences.reduceMotion,
        reduceHaptics: preferences.reduceHaptics
      });
    };

    void hydrateFeedbackPreferences();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      stopIngestRuntime();
      return;
    }

    startIngestRuntime(telemetryReporter);

    return () => {
      stopIngestRuntime();
    };
  }, [session, telemetryReporter]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await hydrateCategoryFeedbackFromStorage();
        const nextSession = await authService.getSession();
        if (!active) {
          return;
        }
        setSession(nextSession);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    };

    bootstrap();

    const subscription = authService.onAuthStateChange((event) => {
      if (!active) {
        return;
      }

      setSession(event.session);
      if (!event.session) {
        setTab('home');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [authService]);

  useEffect(() => {
    if (!session) {
      setStreakDays(0);
      setReviewPendingCount(0);
      setFeatureFlags(getFeatureFlagsForUser());
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const refreshMeta = async () => {
      try {
        const [streak, reviewQueue] = await Promise.all([loadStreakState(), fetchReviewQueue(20)]);
        if (!active) {
          return;
        }
        const flags = getFeatureFlagsForUser({ userId: session.user.id });
        setFeatureFlags(flags);
        setStreakDays(streak.currentStreak);
        setReviewPendingCount(reviewQueue.length);

        if (flags.engagement_notifications_v1) {
          const preferences = await loadEngagementPreferences();
          const missions = await loadOrCreateDailyMissions({
            pendingReviewCount: reviewQueue.length
          });
          await evaluateReminderCandidates({
            userId: session.user.id,
            streak,
            missions,
            remindersEnabled: preferences.remindersEnabled,
            telemetryReporter
          });
        }

        if (flags.leaderboard_hooks_v1) {
          await loadLeaderboardProfile();
        }
      } catch {
        if (!active) {
          return;
        }
        setReviewPendingCount(0);
      }
    };

    void refreshMeta();
    timer = setInterval(() => {
      void refreshMeta();
    }, 30000);

    return () => {
      active = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [session, telemetryReporter]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authService.signOut();
      setSession(null);
      setTab('home');
    } finally {
      setSigningOut(false);
    }
  };

  const handleDevSkip = () => {
    const now = Date.now();
    setSession({
      accessToken: `dev-skip-access-${now}`,
      refreshToken: `dev-skip-refresh-${now}`,
      expiresAtISO: new Date(now + 60 * 60 * 1000).toISOString(),
      user: {
        id: 'dev-skip-user',
        phoneE164: '+919876543210'
      }
    });
    setTab('home');
  };

  const screen = useMemo(() => {
    if (!authReady) {
      return (
        <View style={styles.loadingWrap}>
          <Text tone="secondary">Checking session...</Text>
        </View>
      );
    }

    if (!session) {
      return (
        <OnboardingScreen
          authService={authService}
          onContinue={(nextSession) => setSession(nextSession)}
          onSkip={allowDevSkip ? handleDevSkip : undefined}
        />
      );
    }

    switch (tab) {
      case 'home':
        return <DashboardScreen playfulEnabled={featureFlags.playful_ui_v2} />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'review':
        return <ReviewQueueScreen playfulEnabled={featureFlags.playful_ui_v2} />;
      case 'budgets':
        return <BudgetsScreen />;
      case 'insights':
        return <InsightsScreen playfulEnabled={featureFlags.playful_ui_v2} />;
      case 'settings':
        return <SettingsScreen onSignOut={handleSignOut} signingOut={signingOut} />;
      default:
        return <DashboardScreen playfulEnabled={featureFlags.playful_ui_v2} />;
    }
  }, [allowDevSkip, authReady, authService, featureFlags.playful_ui_v2, session, signingOut, tab]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>{screen}</ScrollView>
      {session ? (
        <View style={styles.tabBar}>
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tabButton}>
                <Text size="caption" tone={active ? 'primary' : 'muted'} weight={active ? '700' : '500'}>
                  {item.label}
                </Text>
                {featureFlags.streaks_v1 && item.key === 'home' && streakDays > 0 ? (
                  <View style={styles.badge}>
                    <Text size="micro" weight="700">
                      🔥{Math.min(streakDays, 99)}
                    </Text>
                  </View>
                ) : null}
                {featureFlags.daily_missions_v1 && item.key === 'review' && reviewPendingCount > 0 ? (
                  <View style={styles.badge}>
                    <Text size="micro" weight="700">
                      {Math.min(reviewPendingCount, 99)}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md
  },
  badge: {
    marginTop: theme.spacing.xs,
    minWidth: 22,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary100,
    borderWidth: 1,
    borderColor: theme.colors.primary500
  }
});
