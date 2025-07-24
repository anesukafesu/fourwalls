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
    expect(screen.getByPlaceholderText('Ask a question...')).toBeDefined();
  });
});
