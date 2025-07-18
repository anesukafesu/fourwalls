
import { useState } from 'react';
import { Database } from '@/integrations/supabase/types';

type PropertyType = Database['public']['Enums']['property_type'];
type PropertyStatus = Database['public']['Enums']['property_status'];

export interface PropertyFormData {
  title: string;
  description: string;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  bedrooms: number;
  bathrooms: number;
  interior_size_sqm: number;
  lot_size_sqm: number;
  year_built: number;
  neighbourhood: string;
  city: string;
  features: string[];
  images: string[];
}

export function usePropertyForm(initialData?: Partial<PropertyFormData>) {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: 'house',
    status: 'for_sale',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    interior_size_sqm: 0,
    lot_size_sqm: 0,
    year_built: new Date().getFullYear(),
    neighbourhood: '',
    city: '',
    features: [],
    images: [],
    ...initialData,
  });

  const [featuresInput, setFeaturesInput] = useState(
    initialData?.features?.join(', ') || ''
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const processFormData = () => ({
    ...formData,
    features: featuresInput.split(',').map(f => f.trim()).filter(f => f.length > 0),
  });

  return {
    formData,
    setFormData,
    featuresInput,
    setFeaturesInput,
    imageFiles,
    setImageFiles,
    handleInputChange,
    processFormData,
  };
}
