
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import PropertyImageGallery from '@/components/PropertyDetails/PropertyImageGallery';
import { withQueryClient } from '../../test-utils';

describe('PropertyImageGallery', () => {
  it('renders placeholder if no images', () => {
    render(
      withQueryClient(
        <PropertyImageGallery
          images={[]}
          title="Sample Property"
          propertyId="1"
          propertyType="apartment"
          city="Kigali"
        />
      )
    );
    expect(screen.getByText(/no image available/i) != null).toBe(true);
  });
});
