import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, GripVertical } from 'lucide-react';
import ImageItem from './ImageItem';
import ImageModal from './ImageModal';
import { PropertyFormData } from '@/hooks/usePropertyForm';
import { deleteImageFromStorage } from '@/utils/imageUtils';

interface ImageUploadSectionProps {
  formData: PropertyFormData;
  imageFiles: File[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number, isExisting?: boolean) => void;
  onMoveImage: (fromIndex: number, toIndex: number, isExisting?: boolean) => void;
}

const ImageUploadSection = ({
  formData,
  imageFiles,
  onImageUpload,
  onRemoveImage,
  onMoveImage
}: ImageUploadSectionProps) => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const handleRemoveExistingImage = async (index: number, imageUrl: string) => {
    try {
      await deleteImageFromStorage(imageUrl);
      onRemoveImage(index, true);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Still remove from UI even if deletion fails
      onRemoveImage(index, true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="images">Upload Images</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            You can upload multiple images. The first image will be the main photo.
          </p>
        </div>

        {(formData.images.length > 0 || imageFiles.length > 0) && (
          <div className="space-y-4">
            <h4 className="font-medium">Property Images</h4>
            
            {/* Existing images */}
            {formData.images.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Current Images</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <ImageItem
                      key={`existing-${index}`}
                      src={image}
                      alt={`Property image ${index + 1}`}
                      onRemove={() => handleRemoveExistingImage(index, image)}
                      onView={() => setSelectedImage(image)}
                      onMoveUp={index > 0 ? () => onMoveImage(index, index - 1, true) : undefined}
                      onMoveDown={index < formData.images.length - 1 ? () => onMoveImage(index, index + 1, true) : undefined}
                      isPrimary={index === 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* New uploaded images */}
            {imageFiles.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageFiles.map((file, index) => (
                    <ImageItem
                      key={`new-${index}`}
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      onRemove={() => onRemoveImage(index, false)}
                      onView={() => setSelectedImage(URL.createObjectURL(file))}
                      onMoveUp={index > 0 ? () => onMoveImage(index, index - 1, false) : undefined}
                      onMoveDown={index < imageFiles.length - 1 ? () => onMoveImage(index, index + 1, false) : undefined}
                      isPrimary={formData.images.length === 0 && index === 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedImage && (
          <ImageModal
            src={selectedImage}
            alt="Property image"
            onClose={() => setSelectedImage(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
