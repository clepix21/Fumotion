import { Link } from 'react-router-dom';
import reimo from '../../assets/images/reimo.png';

export default function VoiturePage() {
  return (
    <div style={{ textAlign: 'center', padding: 32 }}>
      <h1>Ma petite voiture</h1>
      <img src={reimo} alt="Reimo en voiture" style={{ maxWidth: '90%', height: 'auto' }} />
      <div style={{ marginTop: 16 }}>
        <Link to="/">← Retour à l’accueil</Link>
      </div>
    </div>
  );
}
