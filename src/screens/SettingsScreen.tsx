import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from '../components';
import { theme } from '../theme';

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Settings & Privacy
      </Text>
      <Card>
        <Text weight="700">Notification Access</Text>
        <Text size="caption" tone="secondary">
          Enabled • Last capture 4m ago
        </Text>
      </Card>
      <Card>
        <Text weight="700">Data Controls</Text>
        <Text size="caption" tone="secondary">
          Export your data or request full account deletion anytime.
        </Text>
      </Card>
      <Card>
        <Text weight="700">Pro</Text>
        <Text size="caption" tone="secondary">
          Advanced AI insights, custom rules, unlimited exports.
        </Text>
      </Card>
      <View style={styles.actions}>
        <Button label="Export Data" variant="outline" />
        <Button label="Delete Account" variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  actions: {
    gap: theme.spacing.sm
  }
});
