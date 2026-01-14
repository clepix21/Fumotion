/**
 * Point d'entrée de l'application React
 * Configure le routeur, le provider d'authentification et le rendu
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { initializeApi } from './services/api';

import reportWebVitals from './utils/reportWebVitals';

// Initialiser l'API (notamment le token CSRF) au démarrage
initializeApi();

// Création de la racine React et rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Mesure des performances (optionnel)
reportWebVitals();
