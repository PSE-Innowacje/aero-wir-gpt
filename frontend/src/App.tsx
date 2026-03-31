import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/dashboard/DashboardPage';
import HelicopterListPage from './pages/helicopters/HelicopterListPage';
import CrewListPage from './pages/crew/CrewListPage';
import LandingSiteListPage from './pages/landing-sites/LandingSiteListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/helicopters" element={<HelicopterListPage />} />
          <Route path="/crew" element={<CrewListPage />} />
          <Route path="/landing-sites" element={<LandingSiteListPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
