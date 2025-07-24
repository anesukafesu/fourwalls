
import React, { useState } from 'react';


interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  propertyId: string;
  propertyType: string;
  city: string;
}

const PropertyImageGallery = ({ images, title, propertyId, propertyType, city }: PropertyImageGalleryProps) => {
  const [focusedImageIndex, setFocusedImageIndex] = useState(0);
  
  const focusedImage = images.length > 0 ? images[focusedImageIndex] : null;

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      {focusedImage ? (
        <img
          src={focusedImage}
          alt={title}
          className="w-full h-96 object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      )}

      {/* Image Gallery Thumbnails - Horizontally Scrollable */}
      {images.length > 0 && (
        <div className="w-full">
          <div className="flex space-x-3 overflow-x-auto pb-3 scroll-smooth">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${title} ${index + 1}`}
                className={`h-20 w-32 object-cover rounded cursor-pointer flex-shrink-0 transition-all ${
                  index === focusedImageIndex 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
                onClick={() => setFocusedImageIndex(index)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyImageGallery;
