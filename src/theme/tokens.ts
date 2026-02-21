export const colors = {
  background: '#FFFFFF',
  surface: '#FAFAFA',
  elevated: '#FFFFFF',
  border: '#E9E9E9',
  textPrimary: '#111111',
  textSecondary: '#5B5B5B',
  textMuted: '#888888',
  positive: '#1F7A4F',
  negative: '#8F2D2D',
  overlay: 'rgba(0, 0, 0, 0.35)'
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999
} as const;

export const typography = {
  display: 28,
  h1: 22,
  h2: 18,
  body: 15,
  caption: 13,
  micro: 11
} as const;

export const shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  }
} as const;

export const motion = {
  fast: 140,
  normal: 220
} as const;
