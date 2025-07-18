
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DataDeletionRequest {
  id: string;
  email: string;
  reason: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

const DataDeletionRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['data-deletion-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_deletion_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DataDeletionRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase
        .from('data_deletion_requests')
        .update({ resolved })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-deletion-requests'] });
      toast({
        title: "Success",
        description: "Request status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, resolved }: { ids: string[]; resolved: boolean }) => {
      const { error } = await supabase
        .from('data_deletion_requests')
        .update({ resolved })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-deletion-requests'] });
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected requests updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update selected requests.",
        variant: "destructive",
      });
    },
  });

  const handleToggleResolved = (id: string, resolved: boolean) => {
    updateRequestMutation.mutate({ id, resolved });
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
    if (selectedItems.length === requests?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(requests?.map(item => item.id) || []);
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
        <h1 className="text-3xl font-bold">Data Deletion Requests</h1>
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
            checked={selectedItems.length === requests?.length && requests.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">Select All</span>
        </div>
        <div className="text-sm text-gray-600">
          {selectedItems.length} of {requests?.length || 0} selected
        </div>
      </div>

      <div className="grid gap-4">
        {requests?.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedItems.includes(request.id)}
                    onCheckedChange={() => handleSelectItem(request.id)}
                  />
                  <CardTitle className="text-lg">Data Deletion Request</CardTitle>
                  <Badge variant={request.resolved ? "default" : "secondary"}>
                    {request.resolved ? "Resolved" : "Pending"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleResolved(request.id, !request.resolved)}
                  disabled={updateRequestMutation.isPending}
                >
                  Mark as {request.resolved ? "Unresolved" : "Resolved"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span><strong>Email:</strong> {request.email}</span>
                  <span><strong>Date:</strong> {format(new Date(request.created_at), 'PPp')}</span>
                </div>
                {request.reason && (
                  <div>
                    <p className="text-sm text-gray-600"><strong>Reason:</strong></p>
                    <p className="text-gray-700">{request.reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No data deletion requests found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataDeletionRequests;
