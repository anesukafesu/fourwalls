import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnifiedSearchForm from '../src/components/Search/UnifiedSearchForm';
import { withQueryClient } from './test-utils';

describe('UnifiedSearchForm', () => {
  it('renders the unified search form', () => {
    render(
      withQueryClient(
        <MemoryRouter>
          <UnifiedSearchForm />
        </MemoryRouter>
      )
    );
    // Without jest-dom, check for non-null element
    const input = screen.getByPlaceholderText('Ask a question...');
    expect(input != null).toBe(true);
  });
});
