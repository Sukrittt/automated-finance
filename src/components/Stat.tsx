import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';

interface Props {
  label: string;
  value: string;
  hint?: string;
}

export function Stat({ label, value, hint }: Props) {
  return (
    <View style={styles.wrap}>
      <Text size="caption" tone="secondary">
        {label}
      </Text>
      <Text size="h2" weight="700">
        {value}
      </Text>
      {hint ? (
        <Text size="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4
  }
});
