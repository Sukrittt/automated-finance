import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from '../components';
import { theme } from '../theme';

interface Props {
  onContinue: () => void;
}

export function OnboardingScreen({ onContinue }: Props) {
  return (
    <View style={styles.container}>
      <Text size="display" weight="700">
        Automatic money tracking, finally.
      </Text>
      <Text tone="secondary">
        Grant notification access to auto-detect UPI transactions. No manual entry required.
      </Text>
      <Card>
        <Text size="h2" weight="700">
          Permissions in v1
        </Text>
        <View style={styles.list}>
          <Text tone="secondary">1. Notification access (required for auto capture)</Text>
          <Text tone="secondary">2. Phone OTP (account sync)</Text>
          <Text tone="secondary">3. No READ_SMS for Play build</Text>
        </View>
      </Card>
      <Button label="Continue" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.background
  },
  list: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm
  }
});
