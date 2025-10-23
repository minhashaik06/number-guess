import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NumGuess Pro header', () => {
  render(<App />);
  const header = screen.getByText(/NumGuess Pro/i);
  expect(header).toBeInTheDocument();
});
