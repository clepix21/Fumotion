import { render, screen } from '@testing-library/react';
import App from './App';

test('renders vroum vroum text', () => {
  render(<App />);
  const textElement = screen.getByText(/vroum vroum/i);
  expect(textElement).toBeInTheDocument();
});
