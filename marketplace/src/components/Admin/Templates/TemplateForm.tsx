
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateFormData {
  name: string;
  description: string;
  download_link: string;
}

interface TemplateFormProps {
  onSubmit: (data: TemplateFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<TemplateFormData>;
  title?: string;
}

export const TemplateForm = ({ onSubmit, isLoading, initialData, title = "Add New Template" }: TemplateFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TemplateFormData>({
    defaultValues: initialData
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Template name is required' })}
              placeholder="Enter template name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter template description (optional)"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="download_link">Download Link</Label>
            <Input
              id="download_link"
              type="url"
              {...register('download_link', { 
                required: 'Download link is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL'
                }
              })}
              placeholder="https://example.com/template.zip"
            />
            {errors.download_link && (
              <p className="text-red-500 text-sm mt-1">{errors.download_link.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
