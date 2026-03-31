import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Link,
} from '@mui/material';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { aeroColors } from '../../theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to POST /api/auth/login
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: aeroColors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 3,
      }}
    >
      {/* Top-left corner bracket */}
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 128,
          height: 128,
          borderLeft: `1px solid ${aeroColors.outlineVariant}`,
          borderTop: `1px solid ${aeroColors.outlineVariant}`,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-right corner bracket */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 128,
          height: 128,
          borderRight: `1px solid ${aeroColors.outlineVariant}`,
          borderBottom: `1px solid ${aeroColors.outlineVariant}`,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />
      {/* Radial glow centre */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, #001b33 0%, transparent 70%)',
          opacity: 0.2,
          pointerEvents: 'none',
        }}
      />
      {/* Subtle tactical grid overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage: [
            'linear-gradient(0deg, transparent 24%, rgba(142,145,150,.08) 25%, rgba(142,145,150,.08) 26%, transparent 27%, transparent 74%, rgba(142,145,150,.08) 75%, rgba(142,145,150,.08) 76%, transparent 77%, transparent)',
            'linear-gradient(90deg, transparent 24%, rgba(142,145,150,.08) 25%, rgba(142,145,150,.08) 26%, transparent 27%, transparent 74%, rgba(142,145,150,.08) 75%, rgba(142,145,150,.08) 76%, transparent 77%, transparent)',
          ].join(', '),
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 448 }}>

        {/* Brand header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '3rem',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: aeroColors.primary,
              lineHeight: 1,
              mb: 1,
            }}
          >
            AERO
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ height: 1, width: 32, backgroundColor: aeroColors.tertiary }} />
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.625rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: aeroColors.tertiary,
                fontWeight: 600,
              }}
            >
              Tactical Aviation Intelligence
            </Typography>
            <Box sx={{ height: 1, width: 32, backgroundColor: aeroColors.tertiary }} />
          </Box>
        </Box>

        {/* Glassmorphism login card */}
        <Box
          sx={{
            background: 'rgba(30, 32, 35, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            p: 4,
            boxShadow: '0 24px 48px rgba(0, 27, 51, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Tactical corner accent line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: -20,
                width: '140%',
                height: '1px',
                backgroundColor: `${aeroColors.tertiary}4d`,
                transform: 'rotate(45deg)',
              }}
            />
          </Box>

          {/* Card heading */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 500,
                color: aeroColors.onSurface,
              }}
            >
              Panel Autoryzacji
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: aeroColors.onSurfaceVariant, mt: 0.5, lineHeight: 1.5 }}>
              Wymagane poświadczenia operacyjne dla personelu floty.
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Email */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: aeroColors.outline,
                  mb: 1,
                  display: 'block',
                }}
                component="label"
                htmlFor="login"
              >
                Email / Login
              </Typography>
              <TextField
                fullWidth
                id="login"
                name="login"
                type="text"
                placeholder="identyfikator_pilota"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailIcon sx={{ color: aeroColors.outline, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Password */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: aeroColors.outline,
                  }}
                  component="label"
                  htmlFor="password"
                >
                  Hasło
                </Typography>
                <Link
                  href="#"
                  underline="hover"
                  sx={{
                    fontSize: '0.625rem',
                    color: `${aeroColors.primary}99`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                    '&:hover': { color: aeroColors.primary },
                  }}
                >
                  Nie pamiętasz hasła?
                </Link>
              </Box>
              <TextField
                fullWidth
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOpenIcon sx={{ color: aeroColors.outline, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Security notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1.5,
                backgroundColor: `${aeroColors.surfaceContainerHigh}80`,
                borderRadius: 1.5,
              }}
            >
              <SecurityIcon sx={{ color: aeroColors.secondary, fontSize: 16, mt: 0.25, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.625rem', color: aeroColors.onSurfaceVariant, lineHeight: 1.6 }}>
                Dostęp ograniczony do autoryzowanego personelu AERO. Wszystkie sesje są
                monitorowane pod kątem zgodności z protokołami bezpieczeństwa lotów.
              </Typography>
            </Box>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ChevronRightIcon />}
              sx={{
                py: 1.75,
                borderRadius: 2,
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #abc9ef 0%, #6785a8 100%)',
                color: '#001d35',
                boxShadow: '0 4px 24px rgba(0, 27, 51, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #abc9ef 0%, #6785a8 100%)',
                  opacity: 0.9,
                  boxShadow: '0 6px 28px rgba(0, 27, 51, 0.35)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              Zaloguj się
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: aeroColors.outline }}>
                Status Systemu
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: aeroColors.tertiary,
                    '@keyframes aero-pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.35 },
                    },
                    animation: 'aero-pulse 2s ease-in-out infinite',
                  }}
                />
                <Typography sx={{ fontSize: '0.625rem', color: aeroColors.tertiary, fontWeight: 500 }}>
                  OPERACYJNY
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: 1, height: 32, backgroundColor: `${aeroColors.outlineVariant}4d` }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: aeroColors.outline }}>
                Wersja Terminala
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', color: aeroColors.onSurfaceVariant, fontWeight: 500, mt: 0.75 }}>
                v4.12.0-SEC
              </Typography>
            </Box>

          </Box>

          <Typography sx={{ fontSize: '0.5625rem', color: `${aeroColors.outline}66`, letterSpacing: '0.02em' }}>
            © 2026 AERO TACTICAL INTELLIGENCE SYSTEMS. WSZELKIE PRAWA ZASTRZEŻONE.
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}
