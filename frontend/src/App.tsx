import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pl';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/dashboard/DashboardPage';
import HelicopterListPage from './pages/helicopters/HelicopterListPage';
import CrewListPage from './pages/crew/CrewListPage';
import LandingSiteListPage from './pages/landing-sites/LandingSiteListPage';
import UserListPage from './pages/users/UserListPage';
import OperationListPage from './pages/operations/OperationListPage';
import OperationFormPage from './pages/operations/OperationFormPage';
import OrderListPage from './pages/orders/OrderListPage';
import OrderFormPage from './pages/orders/OrderFormPage';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/helicopters" element={<HelicopterListPage />} />
              <Route path="/crew" element={<CrewListPage />} />
              <Route path="/landing-sites" element={<LandingSiteListPage />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/operations" element={<OperationListPage />} />
              <Route path="/operations/new" element={<OperationFormPage />} />
              <Route path="/operations/:id" element={<OperationFormPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/new" element={<OrderFormPage />} />
              <Route path="/orders/:id" element={<OrderFormPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
