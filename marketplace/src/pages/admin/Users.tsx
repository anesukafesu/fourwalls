import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Crown, Plus, Ban, UserCheck } from "lucide-react";

interface UserWithRole {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
  is_blocked: boolean | null;
  role?: "admin" | "user";
}

function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [creditsToAdd, setCreditsToAdd] = useState<Record<string, number>>({});

  // Fetch users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, avatar_url, credits, created_at, is_blocked"
        )
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      return profiles?.map((profile) => ({
        ...profile,
        role: roleMap.get(profile.id) || "user",
      })) as UserWithRole[];
    },
  });

  // Promote user to admin
  const promoteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("promote_user_to_admin", {
        target_user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Success",
        description: "User promoted to admin successfully",
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

  // Remove admin role
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("remove_admin_role", {
        target_user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Success",
        description: "Admin role removed successfully",
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

  // Grant credits to user
  const grantCreditsMutation = useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: {
      userId: string;
      amount: number;
    }) => {
      const { error } = await supabase.rpc("grant_user_credits", {
        target_user_id: userId,
        credit_amount: amount,
        description: `Admin granted ${amount} credits`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Success",
        description: "Credits granted successfully",
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

  // Block/Unblock user
  const toggleBlockMutation = useMutation({
    mutationFn: async ({
      userId,
      blockStatus,
    }: {
      userId: string;
      blockStatus: boolean;
    }) => {
      const { error } = await supabase.rpc("toggle_user_block_status", {
        target_user_id: userId,
        block_status: blockStatus,
      });
      if (error) throw error;
    },
    onSuccess: (_, { blockStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Success",
        description: `User ${
          blockStatus ? "blocked" : "unblocked"
        } successfully`,
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

  const filteredUsers = users?.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGrantCredits = (userId: string) => {
    const amount = creditsToAdd[userId] || 0;
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of credits",
        variant: "destructive",
      });
      return;
    }
    grantCreditsMutation.mutate({ userId, amount });
    setCreditsToAdd((prev) => ({ ...prev, [userId]: 0 }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 mt-2">
          Manage user accounts and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers?.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {user.full_name || "No name provided"}
                    </h3>
                    <p className="text-gray-600">{user.email || "No email"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {user.credits} credits
                      </span>
                      {user.is_blocked && (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Credits Management */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Credits"
                      value={creditsToAdd[user.id] || ""}
                      onChange={(e) =>
                        setCreditsToAdd((prev) => ({
                          ...prev,
                          [user.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGrantCredits(user.id)}
                      disabled={grantCreditsMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Block/Unblock User */}
                  <Button
                    size="sm"
                    variant={user.is_blocked ? "default" : "destructive"}
                    onClick={() =>
                      toggleBlockMutation.mutate({
                        userId: user.id,
                        blockStatus: !user.is_blocked,
                      })
                    }
                    disabled={toggleBlockMutation.isPending}
                  >
                    {user.is_blocked ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Block
                      </>
                    )}
                  </Button>

                  {/* Role Management */}
                  {user.role === "admin" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeAdminMutation.mutate(user.id)}
                      disabled={removeAdminMutation.isPending}
                    >
                      Remove Admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => promoteUserMutation.mutate(user.id)}
                      disabled={promoteUserMutation.isPending}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Make Admin
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No users found matching your search.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Users;
