import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

const LegalDocumentEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*");

      if (error) throw error;

      const termsDoc = data?.find((doc) => doc.document_type === "terms");
      const privacyDoc = data?.find((doc) => doc.document_type === "privacy");

      setTermsContent(termsDoc?.content || "");
      setPrivacyContent(privacyDoc?.content || "");
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

  const saveDocument = async (type: "terms" | "privacy", content: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("legal_documents").upsert(
        {
          document_type: type,
          content: content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "document_type",
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `${
          type === "terms" ? "Terms of Service" : "Privacy Policy"
        } saved successfully`,
      });
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
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-700">
          Legal Documents Editor
        </h1>
      </div>

      <Tabs defaultValue="terms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                placeholder="Enter Terms of Service content..."
                className="min-h-[400px] resize-none"
              />
              <Button
                onClick={() => saveDocument("terms", termsContent)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Terms of Service"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={privacyContent}
                onChange={(e) => setPrivacyContent(e.target.value)}
                placeholder="Enter Privacy Policy content..."
                className="min-h-[400px] resize-none"
              />
              <Button
                onClick={() => saveDocument("privacy", privacyContent)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Privacy Policy"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalDocumentEditor;
