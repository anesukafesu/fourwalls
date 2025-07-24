import React from 'react';
import { describe, it, expect } from 'vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from '../src/components/Home/Hero';
import { withQueryClient } from './test-utils';

describe('Hero', () => {
  it('renders the hero section', () => {
    render(
      withQueryClient(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      )
    );
    const matches = screen.queryAllByText((content, node) => {
      const hasText = (node) =>
        node.textContent?.includes("Kigali's most") &&
        node.textContent?.includes('delightful') &&
        node.textContent?.includes('housing marketplace');
      return hasText(node);
    });
    expect(matches.length).toBeGreaterThan(0);
  });
});
