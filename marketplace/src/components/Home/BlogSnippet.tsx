
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';

const BlogSnippet = () => {
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ["latest-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, body, published_at")
        .not("published_at", "is", null)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#111827]">Latest Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#111827]">Latest Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            No blog posts available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#111827] flex items-center justify-between">
          Latest Blog Posts
          <Link to="/blog">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <div className="prose prose-sm max-w-none mb-3">
                <ReactMarkdown>
                  {post.body.substring(0, 150) + (post.body.length > 150 ? '...' : '')}
                </ReactMarkdown>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(post.published_at), "MMM dd, yyyy")}
                </div>
                <Link to={`/blog/${post.id}`}>
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogSnippet;
