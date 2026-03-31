import { createTheme } from '@mui/material/styles';

export const aeroColors = {
  background: '#111316',
  surface: '#111316',
  surfaceContainerLowest: '#0c0e11',
  surfaceContainerLow: '#1a1c1f',
  surfaceContainer: '#1e2023',
  surfaceContainerHigh: '#282a2d',
  surfaceContainerHighest: '#333538',
  surfaceBright: '#37393d',
  surfaceVariant: '#333538',

  primary: '#abc9ef',
  primaryLight: '#d1e4ff',
  primaryDark: '#6785a8',
  primaryContainer: '#001b33',
  onPrimary: '#103251',
  onPrimaryFixed: '#001d35',
  onPrimaryContainer: '#6785a8',

  secondary: '#ffb693',
  secondaryLight: '#ffdbcc',
  secondaryContainer: '#fe6b00',
  onSecondary: '#561f00',

  tertiary: '#00daf3',
  tertiaryContainer: '#001e23',
  onTertiary: '#00363d',
  onTertiaryContainer: '#0090a1',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  onBackground: '#e2e2e6',
  onSurface: '#e2e2e6',
  onSurfaceVariant: '#c4c6cc',
  outline: '#8e9196',
  outlineVariant: '#44474c',

  inverseSurface: '#e2e2e6',
  inverseOnSurface: '#2f3034',
  inversePrimary: '#436182',
} as const;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: aeroColors.primary,
      light: aeroColors.primaryLight,
      dark: aeroColors.primaryDark,
      contrastText: aeroColors.onPrimaryFixed,
    },
    secondary: {
      main: aeroColors.secondary,
      light: aeroColors.secondaryLight,
      dark: aeroColors.secondaryContainer,
      contrastText: aeroColors.onSecondary,
    },
    error: {
      main: aeroColors.error,
      dark: aeroColors.errorContainer,
      contrastText: aeroColors.onError,
    },
    info: {
      main: aeroColors.tertiary,
      dark: aeroColors.tertiaryContainer,
      contrastText: aeroColors.onTertiary,
    },
    background: {
      default: aeroColors.background,
      paper: aeroColors.surfaceContainer,
    },
    text: {
      primary: aeroColors.onSurface,
      secondary: aeroColors.onSurfaceVariant,
      disabled: aeroColors.outline,
    },
    divider: aeroColors.outlineVariant,
    action: {
      active: aeroColors.onSurface,
      hover: 'rgba(171, 201, 239, 0.08)',
      selected: 'rgba(171, 201, 239, 0.12)',
      disabled: aeroColors.outline,
      disabledBackground: aeroColors.surfaceContainerHigh,
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 500,
    },
    button: {
      fontFamily: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: '0.1em',
    },
    overline: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.2em',
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.6875rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        body: {
          backgroundColor: '#111316',
          color: '#e2e2e6',
          fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        },
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 100px #0c0e11 inset',
          WebkitTextFillColor: '#e2e2e6',
          caretColor: '#e2e2e6',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.1em',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #abc9ef 0%, #6785a8 100%)',
          color: '#001d35',
          boxShadow: '0 4px 24px rgba(0, 27, 51, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #abc9ef 0%, #6785a8 100%)',
            opacity: 0.9,
            boxShadow: '0 4px 24px rgba(0, 27, 51, 0.3)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#0c0e11',
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 218, 243, 0.3)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 218, 243, 0.5)',
            borderWidth: 1,
          },
        },
        input: {
          color: '#e2e2e6',
          fontSize: '0.875rem',
          '&::placeholder': {
            color: 'rgba(142, 145, 150, 0.4)',
            opacity: 1,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
