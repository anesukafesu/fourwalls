
export interface Property {
  id: string;
  title: string;
  city: string;
  neighbourhood: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  images?: string[];
  agent_id: string;
  created_at: string;
  property_type: string;
  description?: string;
  features?: string[];
  updated_at?: string;
  year_built?: number;
  interior_size_sqm?: number;
  lot_size_sqm?: number;
}
