import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ReportAgent = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agentId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });

  const submitReportMutation = useMutation({
    mutationFn: async () => {
      if (!user || !agentId) throw new Error('Authentication required');
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          report_type: 'agent',
          reported_entity_id: agentId,
          reason,
          details,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report submitted successfully');
      navigate(-1);
    },
    onError: (error) => {
      toast.error('Failed to submit report: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    submitReportMutation.mutate();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please sign in to report an agent.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agent && (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={agent.avatar_url || ''} />
                <AvatarFallback>{agent.full_name?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{agent.full_name || 'Agent'}</h3>
                <p className="text-gray-600">{agent.email}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Reason for reporting</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unprofessional_behavior">Unprofessional behavior</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="misleading_information">Misleading information</SelectItem>
                <SelectItem value="fraud">Fraudulent activity</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional details</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more details about the issue..."
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={submitReportMutation.isPending || !reason}
            >
              Submit Report
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAgent;