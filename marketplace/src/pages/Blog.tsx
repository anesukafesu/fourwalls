
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      // First get the blog posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;

      // Get author profiles
      const authorIds = postsData?.map(post => post.author_id).filter(Boolean) || [];
      
      if (authorIds.length === 0) {
        return postsData?.map(post => ({ ...post, author_profile: null }));
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', authorIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by user ID
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Combine posts with author profiles
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        author_profile: profilesMap.get(post.author_id) || null,
      }));

      return postsWithProfiles;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Real Estate Blog</h1>
          <p className="text-xl text-gray-600">Stay updated with the latest real estate trends and insights</p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Real Estate</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.body }} />
                  
                  <div className="flex items-center mt-6 pt-6 border-t">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      By {post.author_profile?.full_name || 'Unknown Author'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600">Check back later for real estate insights and updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
