import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PropertyFormData } from '@/hooks/usePropertyForm';

interface PropertyDetailsFieldsProps {
  formData: PropertyFormData;
  onInputChange: (field: keyof PropertyFormData, value: any) => void;
}

export function PropertyDetailsFields({ formData, onInputChange }: PropertyDetailsFieldsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="bedrooms">Bedrooms</Label>
        <Input
          id="bedrooms"
          type="number"
          min="0"
          value={formData.bedrooms}
          onChange={(e) => onInputChange('bedrooms', parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="bathrooms">Bathrooms</Label>
        <Input
          id="bathrooms"
          type="number"
          min="0"
          step="0.5"
          value={formData.bathrooms}
          onChange={(e) => onInputChange('bathrooms', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="interior_size_sqm">Interior Size (sqm)</Label>
        <Input
          id="interior_size_sqm"
          type="number"
          min="0"
          value={formData.interior_size_sqm}
          onChange={(e) => onInputChange('interior_size_sqm', parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="lot_size_sqm">Lot Size (sqm)</Label>
        <Input
          id="lot_size_sqm"
          type="number"
          min="0"
          value={formData.lot_size_sqm}
          onChange={(e) => onInputChange('lot_size_sqm', parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="year_built">Year Built</Label>
        <Input
          id="year_built"
          type="number"
          min="1800"
          max={new Date().getFullYear()}
          value={formData.year_built}
          onChange={(e) => onInputChange('year_built', parseInt(e.target.value) || new Date().getFullYear())}
        />
      </div>
    </div>
  );
}
