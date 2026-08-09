import { Colors } from './colors';
import { Typography } from './typography';

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: Colors.primaryDeep,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    medium: {
      shadowColor: Colors.primaryDeep,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 6,
    },
  },
};

export type ThemeType = typeof Theme;
