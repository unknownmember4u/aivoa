export const theme = {
  colors: {
    primary: {
      DEFAULT: '#2563EB',
      hover: '#1D4ED8',
      light: '#EFF6FF',
      border: '#BFDBFE',
    },
    success: {
      DEFAULT: '#16A34A',
      hover: '#15803D',
      light: '#F0FDF4',
      border: '#BBF7D0',
    },
    warning: {
      DEFAULT: '#D97706',
      hover: '#B45309',
      light: '#FFFBEB',
      border: '#FDE68A',
    },
    danger: {
      DEFAULT: '#DC2626',
      hover: '#B91C1C',
      light: '#FEF2F2',
      border: '#FECACA',
    },
    neutral: {
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      border: '#E2E8F0',
      heading: '#0F172A',
      body: '#475569',
      muted: '#64748B',
      subtle: '#94A3B8',
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: {
      h1: '36px',
      h2: '30px',
      h3: '24px',
      body: '16px',
      small: '14px',
      xs: '12px',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    1: '4px',
    2: '8px',
    4: '16px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    card: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    card: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    modal: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
  },
} as const;

export type Theme = typeof theme;
