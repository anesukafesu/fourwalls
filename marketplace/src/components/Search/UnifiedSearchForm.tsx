import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNeighbourhoods } from "@/hooks/useNeighbourhoods";
import { SearchableDropdown } from "../ui/searchable-dropdown";
import { cn } from "@/lib/utils";

interface SearchFilters {
  neighbourhood?: string;
  propertyType?: string;
  status?: string;
  bedrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  preferredSearchMethod: string
}

interface UnifiedSearchFormProps {
  preferredSearchMethod?: "filter" | "ai";
  variant?: "hero" | "page";
}

const UnifiedSearchForm = ({ variant = "page", preferredSearchMethod }: UnifiedSearchFormProps) => {
  const navigate = useNavigate();
  const { data: neighbourhoods, isLoading: neighbourhoodsLoading } =
    useNeighbourhoods();

  const [aiQuestion, setAIQuestion] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleFilterSearch = () => {
    const filters: SearchFilters = {
      neighbourhood: neighbourhood || "",
      propertyType: propertyType === "all" ? "" : propertyType,
      status: status === "all" ? "" : status,
      bedrooms: bedrooms === "all" ? "" : bedrooms,
      minPrice: minPrice.trim() || "",
      maxPrice: maxPrice.trim() || "",
      preferredSearchMethod: "filter"
    };

    navigate(`/properties?${new URLSearchParams(filters as any).toString()}`);
  };

  const handleAISearch = () => {
    navigate(`/chat?session=ai&prefill=${encodeURIComponent(aiQuestion)}`);
  };

  const clearFilters = () => {
    setNeighbourhood("");
    setPropertyType("");
    setStatus("");
    setBedrooms("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div
      className={cn(
        "w-full",
        "bg-white",
        "rounded-2xl",
        "p-6",
        "shadow-md",
        variant === "hero" ? "max-w-4xl mx-auto" : "max-w-none"
      )}
    >
      <Tabs defaultValue={preferredSearchMethod || "ai"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai">Ask AI Assistant</TabsTrigger>
          <TabsTrigger value="filter">Search with Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="text-center py-8 flex gap-4">
            <Input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAIQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="border-none border-gray-300 border-b"
            />
            <Button
              onClick={handleAISearch}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Bot className="h-5 w-5 mr-2" />
              Send Message
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="filter" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Property Type */}
              <SearchableDropdown
                options={[
                  { id: "house", name: "House" },
                  { id: "apartment", name: "Apartment" },
                  { id: "condo", name: "Condo" },
                  { id: "townhouse", name: "Townhouse" },
                  { id: "land", name: "Land" },
                  { id: "commercial", name: "Commercial" },
                ]}
                value={propertyType}
                onChange={setPropertyType}
                label="Property Type"
                loading={false}
              />

              {/* Neighbourhood */}
              <SearchableDropdown
                options={neighbourhoods || []}
                value={neighbourhood}
                onChange={setNeighbourhood}
                label="Neighbourhood"
                loading={neighbourhoodsLoading}
              />

              <SearchableDropdown
                options={[
                  { id: "for_sale", name: "For Sale" },
                  { id: "for_rent", name: "For Rent" },
                ]}
                value={status}
                onChange={setStatus}
                label="Status"
                loading={false}
              />

              <SearchableDropdown
                options={[
                  { id: "1", name: "1+" },
                  { id: 2, name: "2+" },
                  { id: 3, name: "3+" },
                  { id: 4, name: "4+" },
                  { id: 5, name: "5+" },
                ]}
                value={bedrooms}
                onChange={setBedrooms}
                label="Bedrooms"
                loading={false}
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (RWF)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (RWF)
                </Label>
                <Input
                  type="number"
                  placeholder="50,000,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <Button onClick={handleFilterSearch}>Search</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedSearchForm;
