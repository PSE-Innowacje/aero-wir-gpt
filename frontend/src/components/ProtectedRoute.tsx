import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { aeroColors } from '../theme';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: aeroColors.background,
        }}
      >
        <CircularProgress sx={{ color: aeroColors.tertiary }} />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
