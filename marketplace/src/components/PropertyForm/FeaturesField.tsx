
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FeaturesFieldProps {
  featuresInput: string;
  setFeaturesInput: (value: string) => void;
}

export function FeaturesField({ featuresInput, setFeaturesInput }: FeaturesFieldProps) {
  return (
    <div>
      <Label htmlFor="features">Features (comma-separated)</Label>
      <Input
        id="features"
        value={featuresInput}
        onChange={(e) => setFeaturesInput(e.target.value)}
        placeholder="e.g., Garage, Swimming Pool, Garden, Fireplace"
      />
    </div>
  );
}
