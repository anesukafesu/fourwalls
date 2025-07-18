
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertiesSpotlight from '@/components/Home/PropertiesSpotlight';
import { useRecommendationsFromBookmarks } from '@/hooks/useRecommendations';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks, isLoading } = useBookmarks();

  const { data: recommendations, isLoading: isLoadingRecommendations } = useRecommendationsFromBookmarks();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      for_sale: { label: 'For Sale', className: 'bg-green-100 text-green-800' },
      for_rent: { label: 'For Rent', className: 'bg-blue-100 text-blue-800' },
      sold: { label: 'Sold', className: 'bg-gray-100 text-gray-800' },
      rented: { label: 'Rented', className: 'bg-purple-100 text-purple-800' },
      off_market: { label: 'Off Market', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config?.className}>{config?.label || status}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your bookmarks.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          </div>
          <p className="text-gray-600">
            Properties you've saved for later
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookmarks...</p>
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {bookmarks.map((bookmark) => {
              // Add null checks to prevent accessing properties of undefined
              if (!bookmark.property) return null;
              
              return (
                <Card 
                  key={bookmark.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/properties/${bookmark.property.id}`)}
                >
                  {bookmark.property.images && bookmark.property.images.length > 0 ? (
                    <img
                      src={bookmark.property.images[0]}
                      alt={bookmark.property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="truncate text-lg">{bookmark.property.title}</CardTitle>
                      {getStatusBadge(bookmark.property.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(bookmark.property.price)}
                      </p>
                      <p className="text-gray-600">
                        {bookmark.property.neighbourhood || 'Unknown'}, {bookmark.property.city}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>
                        {bookmark.property.bedrooms || 0} bed • {bookmark.property.bathrooms || 0} bath • {bookmark.property.interior_size_sqm || 0} sq m
                      </p>
                      <p className="capitalize">
                        {bookmark.property.property_type?.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-400 pt-2 border-t">
                      <Bookmark className="h-3 w-3 mr-1" />
                      Saved {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookmarks Yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring properties and bookmark your favorites to see them here.
            </p>
          </div>
        )}

        {/* Recommendations Section */}
        {bookmarks && bookmarks.length > 0 && (
          <PropertiesSpotlight
            properties={recommendations || []}
            isLoading={isLoadingRecommendations}
            title="You might also like"
            subtitle="Recommendations based on your bookmarked properties"
            primaryAction={{
              label: "View All Properties",
              navigateTo: "/properties"
            }}
            emptyStateTitle="No recommendations available"
            emptyStateSubtitle="We couldn't find similar properties at the moment. Try bookmarking more properties to get better recommendations."
            emptyStateAction={{
              label: "Browse Properties",
              navigateTo: "/properties"
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
