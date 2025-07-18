
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ArrowLeft, ArrowRight, X } from 'lucide-react';
import ImageModal from './ImageModal';

interface ImageItemProps {
  imageUrl: string;
  index: number;
  total: number;
  isFeatured: boolean;
  onView: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  propertyTitle: string;
}

const ImageItem = ({
  imageUrl,
  index,
  total,
  isFeatured,
  onView,
  onMoveLeft,
  onMoveRight,
  onDelete,
  propertyTitle
}: ImageItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = () => {
    setIsModalOpen(true);
    onView();
  };

  return (
    <>
      <div className="relative group">
        <img
          src={imageUrl}
          alt={`Property ${index + 1}`}
          className="w-full h-24 object-cover rounded-lg border cursor-pointer"
        />
        
        {/* Hover overlay with buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleView}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={onMoveLeft}
              disabled={index === 0}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={onMoveRight}
              disabled={index === total - 1}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isFeatured && (
          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
            Featured
          </div>
        )}
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
        imageTitle={`${propertyTitle} - Image ${index + 1}`}
      />
    </>
  );
};

export default ImageItem;
