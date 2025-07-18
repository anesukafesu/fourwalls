import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { format } from "date-fns";

interface Report {
  id: string;
  reporter_id: string;
  report_type: string;
  reported_entity_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_by: string | null;
  resolved_at: string | null;
  update_messages: string[] | null;
}

function Reports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [newMessage, setNewMessage] = useState<Record<string, string>>({});

  // Fetch reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Report[];
    },
  });

  // Update report status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      reportId,
      status,
    }: {
      reportId: string;
      status: string;
    }) => {
      const { error } = await supabase.rpc("update_report_status", {
        report_id: reportId,
        new_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add update message
  const addMessageMutation = useMutation({
    mutationFn: async ({
      reportId,
      message,
    }: {
      reportId: string;
      message: string;
    }) => {
      const { error } = await supabase.rpc("add_report_update_message", {
        report_id: reportId,
        message: message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setNewMessage({});
      toast({
        title: "Success",
        description: "Update message added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove update message
  const removeMessageMutation = useMutation({
    mutationFn: async ({
      reportId,
      messageIndex,
    }: {
      reportId: string;
      messageIndex: number;
    }) => {
      const { error } = await supabase.rpc("remove_report_update_message", {
        report_id: reportId,
        message_index: messageIndex,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({
        title: "Success",
        description: "Update message removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_review":
        return <AlertTriangle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "dismissed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddMessage = (reportId: string) => {
    const message = newMessage[reportId];
    if (!message?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    addMessageMutation.mutate({ reportId, message: message.trim() });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mt-2">
            Manage user reports and violations
          </p>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {reports?.map((report) => (
          <Card key={report.id} className="p-0">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(report.status)}
                    <span className="capitalize">
                      {report.report_type} Report
                    </span>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace("_", " ")}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Created: {format(new Date(report.created_at), "PPp")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={report.status}
                    onValueChange={(status) =>
                      updateStatusMutation.mutate({
                        reportId: report.id,
                        status,
                      })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-gray-700">{report.reason}</p>
              </div>

              {report.details && (
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <p className="text-gray-700">{report.details}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Report Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Reporter ID:</strong> {report.reporter_id}
                  </p>
                  <p>
                    <strong>Reported Entity ID:</strong>{" "}
                    {report.reported_entity_id}
                  </p>
                  <p>
                    <strong>Type:</strong> {report.report_type}
                  </p>
                </div>
              </div>

              {report.update_messages && report.update_messages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Update Messages
                  </h4>
                  <div className="space-y-2">
                    {report.update_messages.map((message, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg flex justify-between items-start"
                      >
                        <p className="text-sm">{message}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            removeMessageMutation.mutate({
                              reportId: report.id,
                              messageIndex: index + 1,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Add Update Message</h4>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Enter update message..."
                    value={newMessage[report.id] || ""}
                    onChange={(e) =>
                      setNewMessage((prev) => ({
                        ...prev,
                        [report.id]: e.target.value,
                      }))
                    }
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAddMessage(report.id)}
                    disabled={addMessageMutation.isPending}
                  >
                    Add Message
                  </Button>
                </div>
              </div>

              {report.resolved_at && (
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Resolved:</strong>{" "}
                    {format(new Date(report.resolved_at), "PPp")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {reports?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {selectedStatus == "all"
              ? "No reports found."
              : "No reports found matching your criteria."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Reports;
