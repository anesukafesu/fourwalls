import React from 'react';
import { describe, it, expect } from 'vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyDetailsCard from '../src/components/PropertyDetails/PropertyDetailsCard';
import { withQueryClient } from './test-utils';

describe('PropertyDetailsCard', () => {
  it('renders property details card with expected fields', () => {
    const now = new Date();
    render(
      withQueryClient(
        <MemoryRouter>
          <PropertyDetailsCard property={{
            id: 1,
            title: 'Test Property',
            price: 1000,
            created_at: now.toISOString(),
            property_type: 'apartment',
            bedrooms: 2,
            bathrooms: 1,
            description: 'A lovely place',
            features: ['Balcony', 'Parking'],
            year_built: 2020,
            lot_size: 120,
            square_feet: 80
          }} />
        </MemoryRouter>
      )
    );
    // Card title
    expect(screen.getByText('Property Details') != null).toBe(true);
    // Bedrooms and Bathrooms
    expect(screen.getByText('2') != null).toBe(true);
    expect(screen.getByText('1') != null).toBe(true);
    // Description
    expect(screen.getByText('A lovely place') != null).toBe(true);
    // Features
    expect(screen.getByText('Balcony') != null).toBe(true);
    expect(screen.getByText('Parking') != null).toBe(true);
    // Property Type
    expect(screen.getByText(/apartment/i) != null).toBe(true);
    // Year Built
    expect(screen.getByText(/2020/) != null).toBe(true);
    // Lot Size
    expect(screen.getByText(/120 sq meters/) != null).toBe(true);
    // Sq Meters
    expect(screen.getByText('80') != null).toBe(true);
    // Listed (formatted date)
    const formattedMonth = now.toLocaleString('default', { month: 'short' });
    const formattedYear = now.getFullYear();
    expect(screen.getByText(new RegExp(`${formattedMonth} ${formattedYear}`)) != null).toBe(true);
  });
});
