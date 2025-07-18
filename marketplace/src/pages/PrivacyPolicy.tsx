
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const PrivacyPolicy = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("content")
        .eq("document_type", "privacy")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setContent(data?.content || getDefaultPrivacyPolicy());
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      setContent(getDefaultPrivacyPolicy());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPrivacyPolicy = () => {
    return `Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

This Privacy Policy describes how we collect, use, and share your personal information when you use our real estate platform.

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.

2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send you technical notices and support messages
- Communicate with you about products, services, and events

3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights
You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.

6. Contact Us
If you have any questions about this Privacy Policy, please contact us.

7. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.`;
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
            <CardTitle className="text-center" style={{ color: '#111827' }}>Privacy Policy</CardTitle>
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

export default PrivacyPolicy;
