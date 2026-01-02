/**
 * Composant racine de l'application Fumotion
 * Définit le routage principal avec protection des routes privées
 */
import './styles/App.css';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages d'authentification
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Pages principales
import HomePage from "./pages/HomePage";
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import ChatPage from './pages/ChatPage';

// Pages statiques
import NotFoundPage from './pages/NotFoundPage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import CreditsPage from './pages/CreditsPage';

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/search" element={<SearchPage />} />
      
      {/* Routes protégées (nécessitent authentification) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <CreateTripPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:userId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/credits" element={<CreditsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;