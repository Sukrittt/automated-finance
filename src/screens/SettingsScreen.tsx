import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Chip, Text } from '../components';
import { setFeedbackSettings, triggerLightHaptic, triggerWarningHaptic } from '../services/feedback/playful';
import { theme } from '../theme';
import {
  loadEngagementPreferences,
  saveEngagementPreferences,
  type EngagementPreferences
} from '../services/engagement/preferences';

interface Props {
  onSignOut?: () => void;
  signingOut?: boolean;
}

export function SettingsScreen({ onSignOut, signingOut = false }: Props) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<EngagementPreferences>({
    reduceMotion: false,
    reduceHaptics: false,
    remindersEnabled: true
  });

  React.useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const next = await loadEngagementPreferences();
      if (!active) {
        return;
      }
      setPreferences(next);
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const onExportData = useCallback(() => {
    setStatusMessage('Export request flow is coming soon in this build.');
    triggerLightHaptic();
  }, []);

  const onDeleteAccount = useCallback(() => {
    setStatusMessage('Delete account requires support confirmation in this build.');
    triggerWarningHaptic();
  }, []);

  const updatePreference = useCallback(
    async (next: Partial<EngagementPreferences>) => {
      const saved = await saveEngagementPreferences(next);
      setPreferences(saved);
      setFeedbackSettings({
        reduceMotion: saved.reduceMotion,
        reduceHaptics: saved.reduceHaptics
      });
      triggerLightHaptic();
    },
    []
  );

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
        <Text weight="700">Experience Controls</Text>
        <Text size="caption" tone="secondary">
          Tune motion, haptics, and reminders for your comfort.
        </Text>
        <View style={styles.preferenceRow}>
          <Chip
            label={preferences.reduceMotion ? 'Motion: Reduced' : 'Motion: Full'}
            active={preferences.reduceMotion}
            onPress={() => void updatePreference({ reduceMotion: !preferences.reduceMotion })}
          />
          <Chip
            label={preferences.reduceHaptics ? 'Haptics: Reduced' : 'Haptics: Full'}
            active={preferences.reduceHaptics}
            onPress={() => void updatePreference({ reduceHaptics: !preferences.reduceHaptics })}
          />
        </View>
        <View style={styles.preferenceRow}>
          <Chip
            label={preferences.remindersEnabled ? 'Reminders: On' : 'Reminders: Off'}
            active={preferences.remindersEnabled}
            onPress={() =>
              void updatePreference({
                remindersEnabled: !preferences.remindersEnabled
              })
            }
          />
        </View>
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
  },
  preferenceRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  }
});
