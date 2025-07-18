
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface Report {
  id: string;
  report_type: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  update_messages: string[] | null;
  reported_entity_id: string;
}

const MyReports = () => {
  const { user } = useAuth();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Pending', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      under_review: { 
        label: 'Under Review', 
        className: 'bg-blue-100 text-blue-800',
        icon: MessageSquare
      },
      resolved: { 
        label: 'Resolved', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      dismissed: { 
        label: 'Dismissed', 
        className: 'bg-gray-100 text-gray-800',
        icon: FileText
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getReportTypeLabel = (type: string) => {
    const typeLabels = {
      agent: 'Agent Report',
      listing: 'Listing Report',
      user: 'User Report',
      content: 'Content Report',
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your reports.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          </div>
          <p className="text-gray-600">
            Track the status of reports you've submitted
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your reports...</p>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">
                        {getReportTypeLabel(report.report_type)}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Reason</h4>
                    <p className="text-gray-700 capitalize">{report.reason.replace('_', ' ')}</p>
                  </div>

                  {report.details && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Details</h4>
                      <p className="text-gray-700">{report.details}</p>
                    </div>
                  )}

                  {report.resolved_at && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Resolved Date</h4>
                      <p className="text-gray-700">
                        {new Date(report.resolved_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {report.update_messages && report.update_messages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Admin Feedback
                      </h4>
                      <div className="space-y-2">
                        {report.update_messages.map((message, index) => (
                          <div 
                            key={index}
                            className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-md"
                          >
                            <p className="text-gray-700">{message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Report ID: {report.id}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Submitted</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any reports yet. If you encounter any issues with listings or users, you can report them for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
