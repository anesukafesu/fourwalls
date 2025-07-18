
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Bot } from 'lucide-react';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { usePropertyMutations } from '@/hooks/usePropertyMutations';
import { BasicInfoFields } from '@/components/PropertyForm/BasicInfoFields';
import { PropertyDetailsFields } from '@/components/PropertyForm/PropertyDetailsFields';
import { LocationFields } from '@/components/PropertyForm/LocationFields';
import { FeaturesField } from '@/components/PropertyForm/FeaturesField';
import ImageUploadSection from '@/components/PropertyForm/ImageUploadSection';

function PropertyForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    formData,
    setFormData,
    featuresInput,
    setFeaturesInput,
    imageFiles,
    setImageFiles,
    handleInputChange,
    processFormData,
  } = usePropertyForm();

  const { createMutation, updateMutation } = usePropertyMutations(isEditing, id);

  // Fetch property data for editing
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Sync property data to form state on edit
  useEffect(() => {
    if (property && isEditing) {
      setFormData({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        status: property.status,
        price: property.price,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        interior_size_sqm: property.interior_size_sqm || 0,
        lot_size_sqm: property.lot_size_sqm || 0,
        year_built: property.year_built || new Date().getFullYear(),
        neighbourhood: property.neighbourhood,
        city: property.city,
        features: property.features || [],
        images: property.images || [],
      });
      setFeaturesInput((property.features || []).join(', '));
    }
  }, [property, isEditing, setFormData, setFeaturesInput]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const moveImage = (fromIndex: number, toIndex: number, isExisting: boolean = false) => {
    if (isExisting) {
      setFormData((prev) => {
        const newImages = [...prev.images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        return { ...prev, images: newImages };
      });
    } else {
      setImageFiles((prev) => {
        const newFiles = [...prev];
        const [movedFile] = newFiles.splice(fromIndex, 1);
        newFiles.splice(toIndex, 0, movedFile);
        return newFiles;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = processFormData();
    
    if (isEditing) {
      updateMutation.mutate({ data: processedData, imageFiles });
    } else {
      createMutation.mutate({ data: processedData, imageFiles });
    }
  };

  const handleChatWithAI = () => {
    navigate('/chat');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? 'Edit Property' : 'List New Property'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Property Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <BasicInfoFields 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
              
              <PropertyDetailsFields 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
              
              <LocationFields 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
              
              <FeaturesField 
                featuresInput={featuresInput} 
                setFeaturesInput={setFeaturesInput} 
              />
              
              <ImageUploadSection
                formData={formData}
                imageFiles={imageFiles}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                onMoveImage={moveImage}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Property'
                    : 'Create Property'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleChatWithAI}
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  Chat with AI
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/properties')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PropertyForm;
