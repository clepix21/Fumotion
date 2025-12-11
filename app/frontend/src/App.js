import './styles/App.css'; 
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import HomePage from "./pages/HomePage";
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create-trip" element={<CreateTripPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;