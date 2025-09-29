import { Link } from 'react-router-dom';

export default function ImagePage() {
  return (
    <div style={{ textAlign: 'center', padding: 32 }}>
      <h1>Vroum Vroum 🚗💨</h1>
      <p>Tu as cliqué sur l’image ! Voici la nouvelle page.</p>
      <Link to="/">← Retour à l’accueil</Link>
    </div>
  );
}
