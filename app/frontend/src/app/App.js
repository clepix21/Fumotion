import logo from '../assets/images/Sakuya.png';
import '../styles/App.css';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="logo"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/image')}
        />
        <p>
          Vroum Vroum ᗜˬᗜ
        </p>
        <div style={{ marginTop: 16 }}>
          <Link to="/voiture" style={{ color: '#61dafb' }}>Voir la page voiture →</Link>
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;