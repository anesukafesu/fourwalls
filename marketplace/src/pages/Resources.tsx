import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

function Templates () {
  // Fetch templates from database
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Templates</h1>
            <p className="text-xl text-gray-600">
              Free templates and guides to help you navigate the housing market
            </p>
          </div>
          
          {templatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading templates...</p>
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        Template
                      </Badge>
                      <div className="flex items-center text-gray-500">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {template.name}
                    </CardTitle>
                    <CardDescription>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        Template
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => window.open(template.download_link, '_blank')}
                        className="ml-2"
                      >
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
                <p className="text-gray-600">
                  Templates and guides will appear here when they become available.
                </p>
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Need More Help?</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Our team is here to help with personalized advice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Get personalized assistance with your housing needs. Our experts can help with:
                  </p>
                  <ul className="text-left text-gray-700 space-y-1">
                    <li>• Custom legal documents and contracts</li>
                    <li>• Property valuation and market analysis</li>
                    <li>• Investment strategy consultation</li>
                    <li>• Mortgage and financing guidance</li>
                  </ul>
                  <Button className="w-full">
                    Contact Our Experts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Templates;
