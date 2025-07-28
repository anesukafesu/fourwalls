import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const navigate = useNavigate();

  const { data: legalDocs } = useQuery({
    queryKey: ["legal-documents-footer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-heading font-bold">fourwalls</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kigali's most delightful housing marketplace. Connect with expert
              agents and discover your dream property.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold mb-4 text-gray-300">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => navigate("/properties")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Browse Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/properties/create")}
                  className="hover:text-primary transition-colors text-left"
                >
                  List Property
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/chat")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Housing Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-heading font-bold mb-4 text-gray-300">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => navigate("/blog")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/neighbourhoods")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Neighbourhood Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/templates")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Templates
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/chat")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Housing Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/mortgage-calculator")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Mortgage Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Contact Info */}
          <div>
            <h3 className="font-heading font-bold mb-4 text-gray-300">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400 mb-6">
              {legalDocs?.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() =>
                      navigate(`/legal/${doc.document_type.replace("_", "-")}`)
                    }
                    className="hover:text-primary transition-colors text-left"
                  >
                    {doc.title ||
                      doc.document_type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate("/data-deletion")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Data Deletion Request
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/incident-report")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Incident Report
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; 2024 fourwalls Rwanda. All rights reserved. | Data scraping
            prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
