import logo from '../assets/images/Sakuya.png';
import '../styles/App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ImagePage from './pages/ImagePage';

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
      </header>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/image" element={<ImagePage />} />
    </Routes>
  );
}

export default App;
