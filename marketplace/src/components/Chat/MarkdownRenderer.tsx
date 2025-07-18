import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/Home/PropertyCard";
import { Property } from "@/types/property";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({
  content,
  className = "",
}: MarkdownRendererProps) => {
  // Extract property IDs from the content
  const propertyIdPattern = /<%([^%]+)%>/g;
  const propertyIds = [...content.matchAll(propertyIdPattern)].map(
    (match) => match[1]
  );

  // Fetch properties if any IDs are found
  const { data: properties } = useQuery({
    queryKey: ["inline-properties", propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return [];

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("id", propertyIds);
      if (error) throw error;
      return data as Property[];
    },
    enabled: propertyIds.length > 0,
  });

  const parseMarkdown = (text: string) => {
    // First, handle property embeds
    let processedText = text;

    if (properties && properties.length > 0) {
      propertyIds.forEach((propertyId) => {
        const property = properties.find((p) => p.id === propertyId);
        if (property) {
          const placeholder = `<%${propertyId}%>`;
          processedText = processedText.replace(
            placeholder,
            `<div class="property-embed" data-property-id="${propertyId}"></div>`
          );
        }
      });
    }

    // Bold text
    processedText = processedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    // Italic text
    processedText = processedText.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Code blocks
    processedText = processedText.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
    );

    // Links
    processedText = processedText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Line breaks
    processedText = processedText.replace(/\n/g, "<br>");

    return processedText;
  };

  const renderContent = () => {
    const processedHtml = parseMarkdown(content);

    // Split by property embeds to render them as React components
    const parts = processedHtml.split(
      /(<div class="property-embed" data-property-id="[^"]+"><\/div>)/
    );

    return parts.map((part, index) => {
      const propertyMatch = part.match(/data-property-id="([^"]+)"/);
      if (propertyMatch) {
        const propertyId = propertyMatch[1];
        const property = properties?.find((p) => p.id === propertyId);
        if (property) {
          return (
            <div key={index} className="my-3">
              <PropertyCard property={property} />
            </div>
          );
        }
        return null;
      }

      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {renderContent()}
    </div>
  );
};

export default MarkdownRenderer;
