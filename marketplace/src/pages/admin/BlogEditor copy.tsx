
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import MarkdownEditor from "@/components/Common/MarkdownEditor";

interface BlogPost {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string;
}

function BlogEditor() {
  let { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [publishedAt, setPublishedAt] = useState("");

  if (id === "new") id = undefined;

  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
      if (post.published_at) {
        setPublishedAt(new Date(post.published_at).toISOString().slice(0, 16));
      }
    }
  }, [post]);

  const savePostMutation = useMutation({
    mutationFn: async (isDraft: boolean) => {
      const postData = {
        title: title.trim(),
        body: body.trim(),
        author_id: user?.id,
        published_at: isDraft ? null : publishedAt || new Date().toISOString(),
      };

      if (isEditing) {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(postData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, isDraft) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success(
        `Blog post ${isDraft ? "saved as draft" : "published"} successfully`
      );
      navigate(-1);
    },
    onError: (error) => {
      toast.error("Failed to save blog post: " + error.message);
    },
  });

  const handleSaveDraft = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    savePostMutation.mutate(true);
  };

  const handlePublish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    savePostMutation.mutate(false);
  };

  const isPublished = post?.published_at !== null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Post" : "Create New Post"}
            </h1>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={savePostMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={savePostMutation.isPending}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isEditing && isPublished ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Details Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                  />
                </div>

                <div>
                  <Label htmlFor="publishedAt">Publish Date (optional)</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to publish immediately. Future dates will
                    schedule the post.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Markdown Editor */}
          <div className="lg:col-span-2">
            <MarkdownEditor
              value={body}
              onChange={setBody}
              placeholder="Write your blog post content here using Markdown..."
              title="Blog Post Content"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogEditor;
