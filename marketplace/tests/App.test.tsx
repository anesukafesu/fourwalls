import React from 'react';
import { describe, it, expect } from 'vitest';

import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getAllByText(/fourwalls/i).length).toBeGreaterThan(0);
  });
});
