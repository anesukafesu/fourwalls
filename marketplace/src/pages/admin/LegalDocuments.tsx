import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, FileText, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import MarkdownEditor from "@/components/Common/MarkdownEditor";

interface LegalDocument {
  id: string;
  document_type: string;
  content: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

function LegalDocuments() {
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDocType, setNewDocType] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const queryClient = useQueryClient();

  // Fetch all legal documents
  const { data: legalDocs, isLoading } = useQuery({
    queryKey: ["legal-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LegalDocument[];
    },
  });

  // Set content when document is selected
  React.useEffect(() => {
    if (selectedDoc) {
      setEditContent(selectedDoc.content);
      if (isEditing) {
        setNewDocType(selectedDoc.document_type);
        setNewDocTitle(selectedDoc.title || "");
      }
    }
  }, [selectedDoc, isEditing]);

  // Save document mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      content,
      title,
    }: {
      id?: string;
      type: string;
      content: string;
      title?: string;
    }) => {
      if (id) {
        // Update existing document
        const { data, error } = await supabase
          .from("legal_documents")
          .update({
            document_type: type,
            content: content.trim(),
            title: title,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
        return data;
      } else {
        // Create new document
        const { data, error } = await supabase.from("legal_documents").insert({
          document_type: type,
          content: content.trim(),
          title: title,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["legal-documents"] });
      toast.success("Document saved successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to save document: " + error.message);
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("legal_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["legal-documents"] });
      toast.success("Document deleted successfully");
      setSelectedDoc(null);
    },
    onError: (error) => {
      toast.error("Failed to delete document: " + error.message);
    },
  });

  const resetForm = () => {
    setSelectedDoc(null);
    setIsCreating(false);
    setIsEditing(false);
    setEditContent("");
    setNewDocType("");
    setNewDocTitle("");
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEditing = (doc: LegalDocument) => {
    setSelectedDoc(doc);
    setIsEditing(true);
    setEditContent(doc.content);
    setNewDocType(doc.document_type);
    setNewDocTitle(doc.title || "");
  };

  const handleSave = () => {
    if (!editContent.trim()) {
      toast.error("Document content cannot be empty");
      return;
    }

    if (isCreating) {
      if (!newDocType.trim() || !newDocTitle.trim()) {
        toast.error("Document type and title are required");
        return;
      }
      saveDocumentMutation.mutate({
        type: newDocType,
        content: editContent,
        title: newDocTitle,
      });
    } else if (selectedDoc) {
      saveDocumentMutation.mutate({
        id: selectedDoc.id,
        type: newDocType || selectedDoc.document_type,
        content: editContent,
        title: newDocTitle || selectedDoc.title,
      });
    }
  };

  const handleDelete = (doc: LegalDocument) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(doc.id);
    }
  };

  const handleBackToList = () => {
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading documents...</p>
      </div>
    );
  }

  // Show editor when document is selected or creating new
  if (selectedDoc || isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          <div className="flex space-x-2">
            {selectedDoc && !isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => startEditing(selectedDoc)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedDoc)}
                  disabled={deleteDocumentMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            {(isCreating || isEditing) && (
              <Button
                onClick={handleSave}
                disabled={saveDocumentMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Document
              </Button>
            )}
          </div>
        </div>

        {(isCreating || isEditing) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreating ? "New Document Details" : "Edit Document Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="doc-type">Document Type</Label>
                <Input
                  id="doc-type"
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  placeholder="e.g., privacy, terms_of_service"
                />
              </div>
              <div>
                <Label htmlFor="doc-title">Document Title</Label>
                <Input
                  id="doc-title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g., Privacy Policy"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <MarkdownEditor
          value={editContent}
          onChange={setEditContent}
          placeholder="Write your legal document content here using Markdown..."
          title={
            isCreating
              ? `New ${newDocTitle || "Document"}`
              : selectedDoc?.title || "Document Content"
          }
          readOnly={!isCreating && !isEditing}
        />
      </div>
    );
  }

  // Show document list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          <span className="text-lg font-semibold">Legal Documents</span>
        </div>
        <Button onClick={startCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {legalDocs?.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {doc.title || doc.document_type.replace("_", " ").toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Type: {doc.document_type}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Updated: {new Date(doc.updated_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                {doc.content.substring(0, 100)}...
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(doc)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(doc)}
                  disabled={deleteDocumentMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!legalDocs || legalDocs.length === 0) && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first legal document to get started.
          </p>
          <Button onClick={startCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </div>
      )}
    </div>
  );
}

export default LegalDocuments;
