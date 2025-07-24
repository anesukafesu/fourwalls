import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyCard from '@/components/Home/PropertyCard';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';
import { withQueryClient } from '../../test-utils';

describe('PropertyCard', () => {
  it('renders property title and city', () => {
    const property = {
      id: '1',
      title: 'Modern Apartment',
      price: 150000,
      bedrooms: 2,
      bathrooms: 1,
      city: 'Kigali',
      status: 'for_sale',
      property_type: 'apartment',
    };
    render(
      withQueryClient(
        <AuthProvider value={{ user: null, login: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter>
            <PropertyCard property={property} />
          </MemoryRouter>
        </AuthProvider>
      )
    );
    expect(screen.getByText('Modern Apartment') != null).toBe(true);
    // Use a function matcher to find 'Kigali' even if split by elements or whitespace
    expect(
      screen.getByText((content, node) => {
        if (!node) return false;
        const hasText = (el: Element) => (el.textContent || '').includes('Kigali');
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children).every(
          child => !hasText(child as Element)
        );
        return nodeHasText && childrenDontHaveText;
      }) != null
    ).toBe(true);
  });
});
