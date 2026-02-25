import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from '../theme';

type Tone = 'primary' | 'secondary' | 'muted' | 'positive' | 'negative';
type Size = 'display' | 'h1' | 'h2' | 'body' | 'caption' | 'micro';

interface Props extends TextProps {
  tone?: Tone;
  size?: Size;
  weight?: '400' | '500' | '600' | '700';
}

function getFontFamily(size: Size): string {
  if (size === 'display' || size === 'h1' || size === 'h2') {
    return theme.typography.fontFamilyHeading;
  }
  return theme.typography.fontFamilyBody;
}

export function Text({ tone = 'primary', size = 'body', weight = '500', style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[
        styles.base,
        {
          color: colorMap[tone],
          fontSize: theme.typography[size],
          lineHeight: theme.typography.lineHeight[size],
          fontWeight: weight,
          fontFamily: getFontFamily(size)
        },
        style
      ]}
    />
  );
}

const colorMap = {
  primary: theme.colors.textPrimary,
  secondary: theme.colors.textSecondary,
  muted: theme.colors.textMuted,
  positive: theme.colors.positive,
  negative: theme.colors.negative
};

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0.1
  }
});
