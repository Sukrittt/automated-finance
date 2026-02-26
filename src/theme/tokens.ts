export const colors = {
  // Legacy aliases retained for compatibility.
  background: '#F7FCF2',
  surface: '#F1F9E9',
  elevated: '#FFFFFF',
  border: '#D7E8C8',
  textPrimary: '#14281E',
  textSecondary: '#355341',
  textMuted: '#6E8A79',
  positive: '#2F9E44',
  negative: '#B23A48',
  overlay: 'rgba(10, 24, 17, 0.35)',

  // Playful v2 semantic tiers.
  bgBase: '#F7FCF2',
  bgElevated: '#FFFFFF',
  bgSoft: '#EAF8DF',
  bgGradientStart: '#F7FCF2',
  bgGradientEnd: '#EAF8DF',
  primary100: '#EAF8DF',
  primary500: '#58B947',
  primary600: '#459A35',
  accent500: '#FFB627',
  teal500: '#17B5A4',
  warning500: '#E38B2E',
  success500: '#2F9E44',
  danger500: '#B23A48'
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
  cardLg: 22,
  badge: 14,
  pill: 999
} as const;

export const typography = {
  fontFamilyHeading: 'Nunito',
  fontFamilyBody: 'Manrope',
  display: 30,
  h1: 24,
  h2: 19,
  body: 15,
  caption: 13,
  micro: 11,
  lineHeight: {
    display: 36,
    h1: 30,
    h2: 24,
    body: 22,
    caption: 18,
    micro: 14
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const;

export const shadows = {
  soft: {
    shadowColor: '#123022',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  medium: {
    shadowColor: '#123022',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  press: {
    shadowColor: '#123022',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  }
} as const;

export const motion = {
  fast: 140,
  normal: 220,
  celebrate: 360,
  springGentle: {
    damping: 16,
    stiffness: 180,
    mass: 1
  },
  springPop: {
    damping: 12,
    stiffness: 240,
    mass: 0.9
  }
} as const;
