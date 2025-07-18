import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Neighbourhoods() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: neighbourhoods, isLoading, refetch } = useQuery({
    queryKey: ['admin-neighbourhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('neighbourhoods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Neighbourhood deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting neighbourhood:', error);
      toast({
        title: "Error",
        description: "Failed to delete neighbourhood",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
   
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading neighbourhoods...</div>
        </div>
  
    );
  }

  return (
 
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Neighbourhood Management</h1>
            <p className="text-muted-foreground">
              Manage neighbourhoods in your system
            </p>
          </div>
          <Button 
            onClick={() => navigate('/admin/neighbourhoods/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Neighbourhood
          </Button>
        </div>

        <div className="grid gap-4">
          {neighbourhoods?.map((neighbourhood) => (
            <Card key={neighbourhood.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {neighbourhood.featured_image_url && (
                    <img
                      src={neighbourhood.featured_image_url}
                      alt={neighbourhood.name || "Neighbourhood"}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {neighbourhood.name || "Unnamed Neighbourhood"}
                    </h3>
                    {neighbourhood.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {neighbourhood.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Created {new Date(neighbourhood.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/neighbourhoods/${neighbourhood.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Neighbourhood</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{neighbourhood.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(neighbourhood.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
          
          {neighbourhoods?.length === 0 && (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No neighbourhoods found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first neighbourhood.
              </p>
              <Button onClick={() => navigate('/admin/neighbourhoods/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Neighbourhood
              </Button>
            </Card>
          )}
        </div>
      </div>
  );
}