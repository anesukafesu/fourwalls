
import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertiesSpotlight from '@/components/Home/PropertiesSpotlight';
import PropertyCard from '@/components/Home/PropertyCard';
import { useRecommendationsFromBookmarks } from '@/hooks/useRecommendations';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks, isLoading } = useBookmarks();

  const { data: recommendations, isLoading: isLoadingRecommendations } = useRecommendationsFromBookmarks();

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your bookmarks.</p>
      </div>
    );
  }

  // Transform bookmarks to match PropertyCard expected format
  const bookmarkedProperties = bookmarks?.map(bookmark => ({
    ...bookmark.property,
    id: bookmark.property.id,
    title: bookmark.property.title,
    price: bookmark.property.price,
    bedrooms: bookmark.property.bedrooms,
    bathrooms: bookmark.property.bathrooms,
    interior_size_sqm: bookmark.property.interior_size_sqm,
    neighbourhood: bookmark.property.neighbourhood,
    city: bookmark.property.city,
    images: bookmark.property.images,
    status: bookmark.property.status,
    property_type: bookmark.property.property_type,
  })) || [];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">My Bookmarks</h1>
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
        ) : bookmarkedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {bookmarkedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
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
        {bookmarkedProperties.length > 0 && (
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
