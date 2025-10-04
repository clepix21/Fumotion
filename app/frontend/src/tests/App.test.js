import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';

test('affiche la page de login par défaut', () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </MemoryRouter>
  );
  // La page d'accueil devrait afficher le bouton "Connexion" dans la navbar
  expect(screen.getByRole('button', { name: /Connexion/i })).toBeInTheDocument();
  // Et le bouton "Inscription" aussi
  expect(screen.getByRole('button', { name: /Inscription/i })).toBeInTheDocument();
  // Et le titre principal de la homepage
  expect(screen.getByText(/Voyagez moins cher/i)).toBeInTheDocument();
});
