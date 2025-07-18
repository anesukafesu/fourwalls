
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';

interface BookmarkButtonProps {
  propertyId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const BookmarkButton = ({ propertyId, size = 'default', variant = 'outline' }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark, isToggling } = useBookmarks();

  if (!user) return null;

  const bookmarked = isBookmarked(propertyId);

  return (
    <Button
      size={size}
      variant={bookmarked ? 'default' : variant}
      onClick={() => toggleBookmark(propertyId)}
      disabled={isToggling}
      className={`flex items-center space-x-1 ${
        bookmarked ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''
      }`}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
    </Button>
  );
};

export default BookmarkButton;
