
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Facebook, AlertCircle, Calendar, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  attachments?: {
    data: Array<{
      media?: {
        image?: {
          src: string;
        };
      };
      subattachments?: {
        data: Array<{
          media?: {
            image?: {
              src: string;
            };
          };
        }>;
      };
    }>;
  };
}

interface FacebookImportWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'; // This should be provided by the user

export const FacebookImportWizard = ({ onClose, onComplete }: FacebookImportWizardProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [housingPosts, setHousingPosts] = useState<FacebookPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    script.onload = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    window.FB.login((response: any) => {
      if (response.authResponse) {
        setAccessToken(response.authResponse.accessToken);
        fetchFacebookPosts(response.authResponse.accessToken);
        setCurrentStep(3);
      } else {
        toast.error('Facebook login failed');
        setIsLoading(false);
      }
    }, { scope: 'user_posts' });
  };

  const fetchFacebookPosts = async (token: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me/posts?fields=id,message,created_time,full_picture,attachments{media,subattachments}&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setPosts(data.data || []);
      
      // Filter housing-related posts using a simple keyword check
      const housingKeywords = [
        'house', 'home', 'property', 'real estate', 'for sale', 'for rent',
        'bedroom', 'bathroom', 'kitchen', 'garage', 'yard', 'apartment',
        'condo', 'listing', 'price', 'sqft', 'square feet', 'mortgage'
      ];
      
      const filtered = data.data?.filter((post: FacebookPost) => {
        const message = post.message?.toLowerCase() || '';
        return housingKeywords.some(keyword => message.includes(keyword));
      }) || [];
      
      setHousingPosts(filtered);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Facebook posts:', error);
      toast.error('Failed to fetch Facebook posts');
      setIsLoading(false);
    }
  };

  const handlePostSelection = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, postId]);
    } else {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    }
  };

  const submitForProcessing = async () => {
    if (selectedPosts.length === 0) {
      toast.error('Please select at least one post to process');
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedPostData = housingPosts.filter(post => selectedPosts.includes(post.id));
      
      const { data, error } = await supabase.functions.invoke('extract-facebook-post', {
        body: {
          posts: selectedPostData,
          user_id: user?.id
        }
      });

      if (error) throw error;

      toast.success(`Successfully processed ${selectedPosts.length} posts`);
      onComplete();
    } catch (error) {
      console.error('Error processing posts:', error);
      toast.error('Failed to process posts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHousingPosts = housingPosts.filter(post => {
    if (!dateFilter) return true;
    const postDate = new Date(post.created_time);
    const filterDate = new Date(dateFilter);
    return postDate >= filterDate;
  });

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Facebook className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Import Properties from Facebook</h2>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This application will request one-time access to your public Facebook posts to help you import property listings. 
                An AI system will analyze your posts to identify housing-related content and convert them into property listings.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>We only access your public posts, not private messages or personal information</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>AI processing is done securely and your data is not stored permanently</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>You can review and select which posts to import before processing</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button onClick={() => setCurrentStep(2)} className="flex-1">
                I understand and wish to continue
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <Facebook className="h-16 w-16 text-blue-600 mx-auto" />
            <h2 className="text-2xl font-bold">Connect to Facebook</h2>
            <p className="text-gray-600">
              Click the button below to authorize access to your Facebook posts. 
              You'll be redirected to Facebook to grant permission.
            </p>
            
            <Button 
              onClick={handleFacebookLogin} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Connecting...' : 'Connect with Facebook'}
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Select Posts to Import</h2>
              <Badge variant="outline">
                {housingPosts.length} housing-related posts found
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Filter by date:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDateFilter('')}
              >
                Clear
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {filteredHousingPosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={(checked) => 
                        handlePostSelection(post.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.created_time).toLocaleDateString()}</span>
                        {post.full_picture && (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            <span>Has image</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm">{post.message || 'No text content'}</p>
                      {post.full_picture && (
                        <img 
                          src={post.full_picture} 
                          alt="Post image" 
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredHousingPosts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No housing-related posts found for the selected date range.</p>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button 
                onClick={submitForProcessing}
                disabled={selectedPosts.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : `Process ${selectedPosts.length} Selected Posts`}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Facebook Import Wizard</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};
