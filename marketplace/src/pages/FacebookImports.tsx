import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, ExternalLink, Calendar, MessageSquare, Image, Import, CheckSquare, Square, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useServices } from '@/contexts/ServicesContext';

interface ListingBuffer {
  id: string;
  post_id: string | null;
  post_text: string | null;
  image_urls: string[] | null;
  source_url: string | null;
  extracted_at: string;
  created_at: string;
}

const FACEBOOK_APP_ID = '701950319351567';
const REDIRECT_URI = `${window.location.origin}/facebook-imports`;

const FacebookImports = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<ListingBuffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { services } = useServices();

  useEffect(() => {
    if (user) {
      const code = searchParams.get('code');
      if (code) {
        handleFacebookCallback(code);
      } else {
        fetchListings();
      }
    }
  }, [user, searchParams]);

  const handleFacebookCallback = async (code: string) => {
    setLoading(false);
    setImporting(true);
    try {
      if (!services) return;
      const response = await fetch(`${services['MIGRATIONS']}/migrate/facebook`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        method: 'POST',
        body: JSON.stringify({ 
          code: code,
          redirect_uri: REDIRECT_URI
        })
      });

      if (!response.ok) throw response.statusText;

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message || "Facebook posts processed successfully",
      });

      // Fetch listings after successful import
      await fetchListings();
    } catch (error) {
      console.error('Error importing from Facebook:', error);
      toast({
        title: "Error",
        description: "Failed to import Facebook posts",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings_buffer')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Facebook imports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings_buffer')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListings(listings.filter(listing => listing.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast({
        title: "Success",
        description: "Listing removed from imports",
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(listings.map(listing => listing.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleFetchFromFacebook = () => {
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_posts&response_type=code`;
    
    window.location.href = facebookAuthUrl;
  };

  const handleExtractSelected = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one listing to extract",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmExtract = async () => {
    setShowConfirmModal(false);
    setParsing(true);
    
    try {
      if (!services) return;
      const response = await fetch(`${services['MIGRATIONS']}/parse`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        method: 'POST',
        body: JSON.stringify({ 
          post_ids: Array.from(selectedIds),
          user_id: user?.id 
        })
      });

      if (!response.ok) throw await response.text();

      const result = await response.json();

      const addedCount = result.properties_added || 0;
      const submittedCount = selectedIds.size;
      
      toast({
        title: "Extraction Complete",
        description: `${addedCount} properties were added. ${submittedCount - addedCount} posts lacked sufficient information.`,
      });

      // Navigate to my-properties page
      navigate('/my-properties');
    } catch (error) {
      console.error('Error parsing posts:', error);
      toast({
        title: "Error",
        description: "Failed to parse and extract posts",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Please log in to view Facebook imports</h1>
          </div>
        </div>
      </div>
    );
  }

  if (loading || importing || parsing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              {importing ? 'Fetching Facebook posts...' : parsing ? 'Extracting listings from posts...' : 'Loading...'}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facebook Imports</h1>
            <p className="mt-2 text-gray-600">
              Posts extracted from Facebook ({listings.length} items, {selectedIds.size} selected)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleFetchFromFacebook}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Facebook className="h-4 w-4" />
              Fetch Listings from Facebook
            </Button>
            {listings.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={selectAll}
                  className="flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Clear Selection
                </Button>
                <Button
                  onClick={handleExtractSelected}
                  className="flex items-center gap-2"
                  disabled={selectedIds.size === 0}
                >
                  <Import className="h-4 w-4" />
                  Extract Listings from Selected
                </Button>
              </>
            )}
          </div>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No extracted posts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fetch posts from Facebook to see them here
                </p>
                <Button
                  onClick={handleFetchFromFacebook}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Fetch Listings from Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                        {listing.post_id ? `Post ID: ${listing.post_id}` : 'Extracted Post'}
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
                                img.style.display = 'none';
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
        )}

        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Extraction</DialogTitle>
            </DialogHeader>
            <p className="text-gray-700">
              Are you sure you want to extract listings from the {selectedIds.size} selected posts? 
              The remaining posts in your Facebook imports will be deleted.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmExtract}>
                Extract Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FacebookImports;
