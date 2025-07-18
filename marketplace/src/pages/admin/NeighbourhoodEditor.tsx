import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, Trash2, Upload } from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminNeighbourhoodEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { data: neighbourhood, isLoading } = useQuery({
    queryKey: ['neighbourhood', id],
    queryFn: async () => {
      if (isNew) return null;
      
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (neighbourhood && !isNew) {
      setName(neighbourhood.name || '');
      setDescription(neighbourhood.description || '');
      setImagePreview(neighbourhood.featured_image_url || '');
    }
  }, [neighbourhood, isNew]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let featuredImageUrl = neighbourhood?.featured_image_url || '';

      // Handle image upload if a new image was selected
      if (imageFile && name) {
        // Delete existing image if it exists
        if (neighbourhood?.featured_image_url) {
          const oldPath = neighbourhood.featured_image_url.split('/').pop();
          if (oldPath) {
            await supabase.storage
              .from('neighbourhood-images')
              .remove([oldPath]);
          }
        }

        // Upload new image
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('neighbourhood-images')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('neighbourhood-images')
          .getPublicUrl(fileName);

        featuredImageUrl = publicUrl;
      }

      // Save neighbourhood data
      const neighbourhoodData = {
        name,
        description,
        featured_image_url: featuredImageUrl || null,
      };

      if (isNew) {
        const { error } = await supabase
          .from('neighbourhoods')
          .insert(neighbourhoodData);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('neighbourhoods')
          .update(neighbourhoodData)
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Neighbourhood ${isNew ? 'created' : 'updated'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-neighbourhoods'] });
      navigate('/admin/neighbourhoods');
    },
    onError: (error) => {
      console.error('Error saving neighbourhood:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNew ? 'create' : 'update'} neighbourhood`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (isNew || !id) return;
      
      const { error } = await supabase
        .from('neighbourhoods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Neighbourhood deleted successfully",
      });
      navigate('/admin/neighbourhoods');
    },
    onError: (error) => {
      console.error('Error deleting neighbourhood:', error);
      toast({
        title: "Error",
        description: "Failed to delete neighbourhood",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
     
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading neighbourhood...</div>
        </div>
     
    );
  }

  return (
   
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/neighbourhoods')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isNew ? 'Create Neighbourhood' : 'Edit Neighbourhood'}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? 'Add a new neighbourhood to your system' : 'Update neighbourhood information'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !name.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            
            {!isNew && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Neighbourhood</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this neighbourhood? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Neighbourhood Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter neighbourhood name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter neighbourhood description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Featured Image</Label>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a featured image for this neighbourhood
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
   
  );
}