import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook, CheckSquare, Square, Import } from "lucide-react";

interface FacebookImportsActionsProps {
  onFetchFromFacebook: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExtractSelected: () => void;
  listingsCount: number;
  selectedCount: number;
}

export const FacebookImportsActions: React.FC<FacebookImportsActionsProps> = ({
  onFetchFromFacebook,
  onSelectAll,
  onClearSelection,
  onExtractSelected,
  listingsCount,
  selectedCount,
}) => (
  <div className="flex items-center gap-4">
    <Button
      onClick={onFetchFromFacebook}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <Facebook className="h-4 w-4" />
      Fetch Listings from Facebook
    </Button>
    {listingsCount > 0 && (
      <>
        <Button
          variant="outline"
          onClick={onSelectAll}
          className="flex items-center gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          Select All
        </Button>
        <Button
          variant="outline"
          onClick={onClearSelection}
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Clear Selection
        </Button>
        <Button
          onClick={onExtractSelected}
          className="flex items-center gap-2"
          disabled={selectedCount === 0}
        >
          <Import className="h-4 w-4" />
          Extract Listings from Selected
        </Button>
      </>
    )}
  </div>
);
