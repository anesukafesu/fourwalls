import React from 'react';
import { describe, it, expect } from 'vitest';
// import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnifiedSearchForm from '@/components/Search/UnifiedSearchForm';
import { withQueryClient } from '../../test-utils';

describe('UnifiedSearchForm', () => {
  it('renders search button', () => {
    render(
      withQueryClient(
        <MemoryRouter>
          <UnifiedSearchForm />
        </MemoryRouter>
      )
    );
    const button = screen.getByRole('button', { name: /send message/i });
    expect(button != null).toBe(true);
  });
});
