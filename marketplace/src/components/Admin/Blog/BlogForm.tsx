import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import MarkdownEditor from '@/components/Common/MarkdownEditor';

interface BlogFormData {
  title: string;
  body: string;
  published_at: string | null;
}

interface BlogFormProps {
  onSubmit: (data: BlogFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<BlogFormData>;
  title?: string;
}

export const BlogForm = ({ onSubmit, isLoading, initialData, title = "Create New Blog Post" }: BlogFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BlogFormData>({
    defaultValues: {
      title: initialData?.title || '',
      body: initialData?.body || '',
      published_at: initialData?.published_at || null
    }
  });

  const isPublished = watch('published_at') !== null;

  const handlePublishToggle = (checked: boolean) => {
    setValue('published_at', checked ? new Date().toISOString() : null);
  };

  const handleBodyChange = (value: string) => {
    setValue('body', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Blog Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Blog title is required' })}
              placeholder="Enter blog title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={handlePublishToggle}
            />
            <Label htmlFor="published">
              {isPublished ? 'Published' : 'Draft'}
            </Label>
          </div>

          <div>
            <Label htmlFor="body">Content</Label>
            <MarkdownEditor
              value={watch('body')}
              onChange={handleBodyChange}
              placeholder="Write your blog post content here..."
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Blog Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
