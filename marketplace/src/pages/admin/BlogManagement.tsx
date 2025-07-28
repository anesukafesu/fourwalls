
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function BlogManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{id: string, title: string} | null>(null);

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`*`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately
      const postsWithProfiles = await Promise.all(
        data.map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', post.author_id)
            .single();
            
          return { ...post, profiles: profile };
        })
      );
      
      return postsWithProfiles;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete blog post: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (post: any) => {
    setPostToDelete({
      id: post.id,
      title: post.title
    });
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!postToDelete) return;
    deleteMutation.mutate(postToDelete.id);
    setPostToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-neutral-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage blog posts and content
          </p>
        </div>
        <Button 
          onClick={() => navigate('/admin/blogs/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Blog Post
        </Button>
      </div>

      <div className="grid gap-4">
        {blogPosts?.map((post) => (
          <Card key={post.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={post.published_at ? "default" : "secondary"}>
                      {post.published_at ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      By {post.profiles?.full_name || post.profiles?.email || 'Unknown'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {new Date(post.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/blog/${post.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/blogs/${post.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(post)}
                    className="text-destructive hover:text-destructive hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {post.body && (
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.body.substring(0, 200)}...
                </p>
              </CardContent>
            )}
          </Card>
        ))}
        
        {blogPosts?.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first blog post.
            </p>
            <Button onClick={() => navigate('/admin/blogs/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Blog Post
            </Button>
          </Card>
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
