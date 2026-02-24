import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text } from './src/components';
import { theme } from './src/theme';
import { createAppAuthService, type AuthSession } from './src/services/auth';
import {
  DashboardScreen,
  InsightsScreen,
  OnboardingScreen,
  ReviewQueueScreen,
  SettingsScreen,
  TransactionsScreen
} from './src/screens';
import { startIngestRuntime, stopIngestRuntime } from './src/services/ingest/runtime';

type Tab = 'home' | 'transactions' | 'review' | 'insights' | 'settings';

const tabs: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'transactions', label: 'Txns' },
  { key: 'review', label: 'Review' },
  { key: 'insights', label: 'Insights' },
  { key: 'settings', label: 'Settings' }
];

export default function App() {
  const [authService] = useState(() => createAppAuthService());
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [tab, setTab] = useState<Tab>('home');

  useEffect(() => {
    if (!session) {
      stopIngestRuntime();
      return;
    }

    startIngestRuntime();

    return () => {
      stopIngestRuntime();
    };
  }, [session]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
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

  const screen = useMemo(() => {
    if (!authReady) {
      return (
        <View style={styles.loadingWrap}>
          <Text tone="secondary">Checking session...</Text>
        </View>
      );
    }

    if (!session) {
      return <OnboardingScreen authService={authService} onContinue={(nextSession) => setSession(nextSession)} />;
    }

    switch (tab) {
      case 'home':
        return <DashboardScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'review':
        return <ReviewQueueScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'settings':
        return <SettingsScreen onSignOut={handleSignOut} signingOut={signingOut} />;
      default:
        return <DashboardScreen />;
    }
  }, [authReady, authService, session, signingOut, tab]);

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
  }
});
