import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/dashboard/DashboardPage';
import HelicopterListPage from './pages/helicopters/HelicopterListPage';
import CrewListPage from './pages/crew/CrewListPage';
import LandingSiteListPage from './pages/landing-sites/LandingSiteListPage';
import UserListPage from './pages/users/UserListPage';
import OperationListPage from './pages/operations/OperationListPage';
import OrderListPage from './pages/orders/OrderListPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="/orders" element={<OrderListPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
