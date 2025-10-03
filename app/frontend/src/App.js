import logo from './assets/images/oguri-cap.gif'; 
import './styles/App.css'; 
import { Routes, Route, useNavigate} from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from "./pages/HomePage"

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
          onClick={() => navigate('/login')}
        />
        <p>
          Vroum Vroum ᗜˬᗜ
        </p>
      </header>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;