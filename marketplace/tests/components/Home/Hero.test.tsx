import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/Home/Hero';
import { withQueryClient } from '../../test-utils';
import { MemoryRouter } from 'react-router-dom';

describe('Hero', () => {
  it('renders the hero headline and description', () => {
    render(withQueryClient(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    ));
    // Headline: check for both 'Kigali' and 'delightful' in the same element (handles split text nodes)
    const headlineEls = screen.getAllByText((content, node) => {
      const text = (node && node.textContent) || '';
      return text.includes("Kigali") && text.includes("delightful");
    });
    expect(headlineEls.length > 0).toBe(true);
    // Subheadline
    const subheadlineEls = screen.getAllByText((content, node) => {
      const text = (node && node.textContent) || '';
      return text.includes("housing marketplace");
    });
    expect(subheadlineEls.length > 0).toBe(true);
    // Description
    const descEls = screen.getAllByText((content, node) => {
      const text = (node && node.textContent) || '';
      return text.includes("Discover your perfect home");
    });
    expect(descEls.length > 0).toBe(true);
  });
});
