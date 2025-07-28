
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function Neighbourhoods() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [neighbourhoodToDelete, setNeighbourhoodToDelete] = useState<{id: string, name: string} | null>(null);

  const { data: neighbourhoods, isLoading, refetch } = useQuery({
    queryKey: ['admin-neighbourhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      // Filter out "Other" neighbourhood from display
      return data?.filter(n => n.name?.toLowerCase() !== 'other') || [];
    },
  });

  const handleDeleteClick = (neighbourhood: any) => {
    setNeighbourhoodToDelete({
      id: neighbourhood.id,
      name: neighbourhood.name || "Unnamed Neighbourhood"
    });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!neighbourhoodToDelete) return;
    
    try {
      const { error } = await supabase
        .from('neighbourhoods')
        .delete()
        .eq('id', neighbourhoodToDelete.id);

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
      setNeighbourhoodToDelete(null);
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
    <div className="space-y-6 bg-neutral-50 min-h-screen p-6">
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

      <div className="grid gap-6">
        {neighbourhoods?.map((neighbourhood) => (
          <Card key={neighbourhood.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex">
              {neighbourhood.featured_image_url && (
                <div className="w-48 h-32 flex-shrink-0">
                  <img
                    src={neighbourhood.featured_image_url}
                    alt={neighbourhood.name || "Neighbourhood"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {neighbourhood.name || "Unnamed Neighbourhood"}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        Created {new Date(neighbourhood.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    {neighbourhood.description && (
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown>
                          {neighbourhood.description.length > 200 
                            ? neighbourhood.description.substring(0, 200) + '...' 
                            : neighbourhood.description
                          }
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/neighbourhoods/${neighbourhood.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(neighbourhood)}
                      className="text-destructive hover:text-destructive hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {neighbourhoods?.length === 0 && (
          <Card className="p-12 text-center bg-white">
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

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Neighbourhood"
        description={`Are you sure you want to delete "${neighbourhoodToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
