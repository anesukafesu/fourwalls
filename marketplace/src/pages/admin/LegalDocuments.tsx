
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function LegalDocuments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{id: string, title: string} | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('legal_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete document: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (document: any) => {
    setDocumentToDelete({
      id: document.id,
      title: document.title || document.document_type
    });
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!documentToDelete) return;
    deleteMutation.mutate(documentToDelete.id);
    setDocumentToDelete(null);
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'privacy_policy':
        return 'bg-blue-100 text-blue-800';
      case 'terms_of_service':
        return 'bg-green-100 text-green-800';
      case 'cookie_policy':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-neutral-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Legal Documents</h1>
          <p className="text-muted-foreground">
            Manage legal documents and policies
          </p>
        </div>
        <Button 
          onClick={() => navigate('/admin/legal-documents/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="grid gap-4">
        {documents?.map((document) => (
          <Card key={document.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {document.title || document.document_type}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getDocumentTypeColor(document.document_type)}>
                      {document.document_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Created {new Date(document.created_at).toLocaleDateString()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Updated {new Date(document.updated_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/legal-documents/${document.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(document)}
                    className="text-destructive hover:text-destructive hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {document.content && (
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {document.content.substring(0, 200)}...
                </p>
              </CardContent>
            )}
          </Card>
        ))}
        
        {documents?.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first legal document.
            </p>
            <Button onClick={() => navigate('/admin/legal-documents/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </Card>
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${documentToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
