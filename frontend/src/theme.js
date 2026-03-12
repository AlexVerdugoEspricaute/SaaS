import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue-600
      light: '#3b82f6', // Blue-500
      dark: '#1d4ed8', // Blue-700
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0f172a', // Slate-900
      light: '#475569', // Slate-600
      dark: '#020617', // Slate-950
    },
    background: {
      default: '#f8fafc', // Slate-50
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a', // Slate-900
      secondary: '#475569' // Slate-600
    },
    success: {
      main: '#059669', // Emerald-600
      light: '#10b981', // Emerald-500
      dark: '#047857' // Emerald-700
    },
    warning: {
      main: '#d97706', // Amber-600
      light: '#f59e0b', // Amber-500
      dark: '#b45309' // Amber-700
    },
    error: {
      main: '#dc2626', // Red-600
      light: '#ef4444', // Red-500
      dark: '#b91c1c' // Red-700
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '3.5rem',
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#475569'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748b'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.04)',
    '0px 8px 16px rgba(0, 0, 0, 0.04)',
    '0px 16px 24px rgba(0, 0, 0, 0.06)',
    '0px 24px 32px rgba(0, 0, 0, 0.08)',
    ...Array(19).fill('0px 24px 32px rgba(0, 0, 0, 0.08)')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          }
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1rem'
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.75rem'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.04)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: '#2563eb'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  }
})

export default theme