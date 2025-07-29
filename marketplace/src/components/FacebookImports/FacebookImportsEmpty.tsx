import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Facebook } from "lucide-react";

interface FacebookImportsEmptyProps {
  onFetchFromFacebook: () => void;
}

export const FacebookImportsEmpty: React.FC<FacebookImportsEmptyProps> = ({
  onFetchFromFacebook,
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No extracted posts
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Fetch posts from Facebook to see them here
        </p>
        <Button
          onClick={onFetchFromFacebook}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Fetch Listings from Facebook
        </Button>
      </div>
    </CardContent>
  </Card>
);
