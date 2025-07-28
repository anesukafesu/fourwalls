import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";
import { MarkdownEditor } from "@/components/Common/MarkdownEditor";
import { Input } from "@/components/ui/input";

const LegalDocumentEditor = () => {
  const { type } = useParams();
  const isNew = type == "new";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    if (type == "new") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .eq("document_type", type)
        .single();

      if (error) throw error;

      setTitle(data.title || "");
      setContent(data.content);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load legal documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("legal_documents").upsert(
        { title, content, document_type: isNew ? typeInput : type },
        {
          onConflict: "document_type",
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `${title} saved successfully`,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-700">Edit {title}</h1>
      </div>
      <Card className="p-4">
        <CardContent className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write the document title"
          />
          {isNew && (
            <Input
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              placeholder="Write document type with hyphens between words (e.g., terms-of-service)"
            />
          )}
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your legal document here using Markdown..."
          />
          <Button
            onClick={saveDocument}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Terms of Service"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalDocumentEditor;
