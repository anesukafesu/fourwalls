
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PropertyFormData } from '@/hooks/usePropertyForm';
import NeighbourhoodSelect from './NeighbourhoodSelect';

interface LocationFieldsProps {
  formData: PropertyFormData;
  onInputChange: (field: keyof PropertyFormData, value: any) => void;
}

export function LocationFields({ formData, onInputChange }: LocationFieldsProps) {
  return (
    <>
      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            required
          />
        </div>
        <NeighbourhoodSelect
          value={formData.neighbourhood}
          onValueChange={(value) => onInputChange('neighbourhood', value)}
          placeholder="Select neighbourhood"
        />
      </div>
    </>
  );
}
