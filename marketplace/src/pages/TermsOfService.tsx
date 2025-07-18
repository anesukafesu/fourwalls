
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const TermsOfService = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("content")
        .eq("document_type", "terms_of_service")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setContent(data?.content || getDefaultTermsOfService());
    } catch (error) {
      console.error("Error fetching terms of service:", error);
      setContent(getDefaultTermsOfService());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTermsOfService = () => {
    return `Terms of Service

Last updated: ${new Date().toLocaleDateString()}

Welcome to our real estate platform. By using our services, you agree to these terms.

1. Acceptance of Terms
By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.

2. User Accounts
You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.

3. Property Listings
All property listings must be accurate and truthful. Misleading information is prohibited.

4. Prohibited Uses
You may not use our service for any illegal or unauthorized purpose.

5. Privacy Policy
Your privacy is important to us. Please review our Privacy Policy for information on how we collect and handle your data.

6. Limitation of Liability
We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

7. Changes to Terms
We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.

8. Contact Information
If you have any questions about these Terms, please contact us.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: '#111827' }}>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-600">{content}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
