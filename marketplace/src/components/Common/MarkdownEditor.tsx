import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  readOnly?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  title = "Content Editor",
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {!readOnly && (
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "edit" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("edit")}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant={activeTab === "preview" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("preview")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {readOnly ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{value}</ReactMarkdown>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
          >
            {/* <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList> */}

            <TabsContent value="edit" className="space-y-4">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[400px] resize-none font-mono"
              />
              <div className="text-sm text-gray-500">
                <p>
                  Markdown formatting is supported. Use **bold**, *italic*, #
                  headers, - lists, etc.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="min-h-[400px] p-4 border rounded-md bg-gray-50">
                {value ? (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{value}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Nothing to preview yet. Switch to Edit tab to add content.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export { MarkdownEditor };
