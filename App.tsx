import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text } from './src/components';
import { theme } from './src/theme';
import {
  DashboardScreen,
  InsightsScreen,
  OnboardingScreen,
  ReviewQueueScreen,
  SettingsScreen,
  TransactionsScreen
} from './src/screens';

type Tab = 'home' | 'transactions' | 'review' | 'insights' | 'settings';

const tabs: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'transactions', label: 'Txns' },
  { key: 'review', label: 'Review' },
  { key: 'insights', label: 'Insights' },
  { key: 'settings', label: 'Settings' }
];

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<Tab>('home');

  const screen = useMemo(() => {
    if (!onboarded) {
      return <OnboardingScreen onContinue={() => setOnboarded(true)} />;
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
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  }, [onboarded, tab]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>{screen}</ScrollView>
      {onboarded ? (
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
