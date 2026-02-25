import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from '../components';
import { triggerLightHaptic, triggerWarningHaptic } from '../services/feedback/playful';
import { theme } from '../theme';

interface Props {
  onSignOut?: () => void;
  signingOut?: boolean;
}

export function SettingsScreen({ onSignOut, signingOut = false }: Props) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const onExportData = useCallback(() => {
    setStatusMessage('Export request flow is coming soon in this build.');
    triggerLightHaptic();
  }, []);

  const onDeleteAccount = useCallback(() => {
    setStatusMessage('Delete account requires support confirmation in this build.');
    triggerWarningHaptic();
  }, []);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Settings & Privacy
      </Text>
      {statusMessage ? <Text tone="secondary">{statusMessage}</Text> : null}
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
        <Button label="Export Data" variant="outline" onPress={onExportData} />
        <Button label="Delete Account" variant="ghost" onPress={onDeleteAccount} />
        <Button
          label={signingOut ? 'Signing Out...' : 'Sign Out'}
          variant="outline"
          onPress={onSignOut}
          disabled={signingOut}
        />
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
