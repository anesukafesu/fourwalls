import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, GripVertical } from 'lucide-react';
import ImageItem from './ImageItem';
import ImageModal from './ImageModal';
import { PropertyFormData } from '@/hooks/usePropertyForm';


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
    // Simply remove from UI - actual deletion handled by backend
    onRemoveImage(index, true);
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
                      imageUrl={image}
                      index={index}
                      total={formData.images.length}
                      isFeatured={index === 0}
                      onView={() => setSelectedImage(image)}
                      onMoveLeft={index > 0 ? () => onMoveImage(index, index - 1, true) : () => {}}
                      onMoveRight={index < formData.images.length - 1 ? () => onMoveImage(index, index + 1, true) : () => {}}
                      onDelete={() => handleRemoveExistingImage(index, image)}
                      propertyTitle="Property"
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
                      imageUrl={URL.createObjectURL(file)}
                      index={index + formData.images.length}
                      total={formData.images.length + imageFiles.length}
                      isFeatured={formData.images.length === 0 && index === 0}
                      onView={() => setSelectedImage(URL.createObjectURL(file))}
                      onMoveLeft={index > 0 ? () => onMoveImage(index, index - 1, false) : () => {}}
                      onMoveRight={index < imageFiles.length - 1 ? () => onMoveImage(index, index + 1, false) : () => {}}
                      onDelete={() => onRemoveImage(index, false)}
                      propertyTitle="Property"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedImage && (
          <ImageModal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            imageUrl={selectedImage || ""}
            imageTitle="Property image"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
