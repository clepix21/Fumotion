import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../app/App';

test('affiche la page de login par défaut', () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
});
