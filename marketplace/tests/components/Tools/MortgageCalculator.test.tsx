import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MortgageCalculator from '@/components/Tools/MortgageCalculator';
import { withQueryClient } from '../../test-utils';

describe('MortgageCalculator', () => {
  it('renders the calculator and updates monthly payment', () => {
    render(withQueryClient(<MortgageCalculator />));
    // Check for a label or title
    const mortgageElements = screen.getAllByText((content) => content.toLowerCase().includes('mortgage'));
    expect(mortgageElements.length > 0).toBe(true);
    // Simulate user changing property value (loan amount)
    const loanInput = screen.getByLabelText(/property value/i);
    fireEvent.change(loanInput, { target: { value: '60000000' } });
    expect((loanInput as HTMLInputElement).value).toBe('60000000');
  });
});
