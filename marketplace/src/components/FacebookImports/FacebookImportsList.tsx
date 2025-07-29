import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  ExternalLink,
  Calendar,
  MessageSquare,
  Image,
} from "lucide-react";
import { ListingBuffer } from "../../hooks/useFacebookImports";

interface FacebookImportsListProps {
  listings: ListingBuffer[];
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  deleteListing: (id: string) => void;
}

export const FacebookImportsList: React.FC<FacebookImportsListProps> = ({
  listings,
  selectedIds,
  toggleSelection,
  deleteListing,
}) => {
  if (listings.length === 0) return null;
  return (
    <div className="grid gap-6">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.has(listing.id)}
                  onCheckedChange={() => toggleSelection(listing.id)}
                />
                <CardTitle className="text-lg">
                  {listing.post_id
                    ? `Post ID: ${listing.post_id}`
                    : "Extracted Post"}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteListing(listing.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 ml-7">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(listing.extracted_at).toLocaleDateString()}
              </div>
              {listing.source_url && (
                <a
                  href={listing.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Source
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {listing.post_text && (
              <div className="mb-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Post Content
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {listing.post_text}
                </p>
              </div>
            )}
            {listing.image_urls && listing.image_urls.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Images ({listing.image_urls.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {listing.image_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                        }}
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center"
                      >
                        <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
