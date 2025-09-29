import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../app/App';

test('renders vroum vroum text', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const textElement = screen.getByText(/vroum vroum/i);
  expect(textElement).toBeInTheDocument();
});
