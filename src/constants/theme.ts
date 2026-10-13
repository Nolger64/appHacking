export const THEME = {
  colors: {
    background: '#070B14',
    surface: '#0F172A',
    surfaceSubtle: '#162238',
    surfaceLight: '#1E293B',
    border: '#2A3B5C',
    borderSubtle: '#1D2A44',
    
    // Accents
    primary: '#00F0A8',       // Neon Emerald
    primaryDark: '#00B87A',
    secondary: '#00C8FF',     // Vivid Cyan
    warning: '#FFB800',       // Amber Gold
    danger: '#FF4565',        // Bright Crimson
    dangerSubtle: 'rgba(255, 69, 101, 0.15)',
    success: '#00F0A8',
    successSubtle: 'rgba(0, 240, 168, 0.15)',
    info: '#38BDF8',
    infoSubtle: 'rgba(56, 189, 248, 0.15)',

    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#070B14',

    // Gradients & Cards
    cardGradientStart: '#111C36',
    cardGradientEnd: '#0A1224',
    goldGradientStart: '#FFD700',
    goldGradientEnd: '#B8860B',
  },
  typography: {
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      display: 34,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
