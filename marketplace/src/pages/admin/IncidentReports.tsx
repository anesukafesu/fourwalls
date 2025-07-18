
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface IncidentReport {
  id: string;
  name: string;
  email: string;
  description: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

const IncidentReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['incident-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IncidentReport[];
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase
        .from('incident_reports')
        .update({ resolved })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-reports'] });
      toast({
        title: "Success",
        description: "Report status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, resolved }: { ids: string[]; resolved: boolean }) => {
      const { error } = await supabase
        .from('incident_reports')
        .update({ resolved })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-reports'] });
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected reports updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update selected reports.",
        variant: "destructive",
      });
    },
  });

  const handleToggleResolved = (id: string, resolved: boolean) => {
    updateReportMutation.mutate({ id, resolved });
  };

  const handleBulkUpdate = (resolved: boolean) => {
    if (selectedItems.length === 0) return;
    bulkUpdateMutation.mutate({ ids: selectedItems, resolved });
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === reports?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(reports?.map(item => item.id) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Incident Reports</h1>
        <div className="flex items-center space-x-2">
          {selectedItems.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleBulkUpdate(true)}
                disabled={bulkUpdateMutation.isPending}
              >
                Mark Selected as Resolved
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkUpdate(false)}
                disabled={bulkUpdateMutation.isPending}
              >
                Mark Selected as Unresolved
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedItems.length === reports?.length && reports.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">Select All</span>
        </div>
        <div className="text-sm text-gray-600">
          {selectedItems.length} of {reports?.length || 0} selected
        </div>
      </div>

      <div className="grid gap-4">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedItems.includes(report.id)}
                    onCheckedChange={() => handleSelectItem(report.id)}
                  />
                  <CardTitle className="text-lg">Incident Report</CardTitle>
                  <Badge variant={report.resolved ? "default" : "secondary"}>
                    {report.resolved ? "Resolved" : "Pending"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleResolved(report.id, !report.resolved)}
                  disabled={updateReportMutation.isPending}
                >
                  Mark as {report.resolved ? "Unresolved" : "Resolved"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span><strong>From:</strong> {report.name}</span>
                  <span><strong>Email:</strong> {report.email}</span>
                  <span><strong>Date:</strong> {format(new Date(report.created_at), 'PPp')}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600"><strong>Description:</strong></p>
                  <p className="text-gray-700">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No incident reports found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncidentReports;
