import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditReviewModal from '@/components/Reviews/EditReviewModal';
import { withQueryClient } from '../../test-utils';

describe('EditReviewModal', () => {
  it('renders modal with review message and rating', () => {
    render(
      withQueryClient(
        <EditReviewModal
          isOpen={true}
          onClose={() => {}}
          review={{ id: '1', rating: 4, message: 'Great experience!', reviewed_user_id: '2' }}
        />
      )
    );
    expect(screen.getByText('Great experience!')).not.toBeNull();
    // There may be multiple elements with 'Review' in the text, so check that at least one exists
    const reviewElements = screen.getAllByText((content) => content.includes('Review'));
    expect(reviewElements.length > 0).toBe(true);
  });
});
