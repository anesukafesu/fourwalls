
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, UserMinus, Coins } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string | null;
  role: string | null;
  property_count: number | null;
  message_count: number | null;
  created_at: string | null;
}

interface UserPromotionCardProps {
  user: User;
  currentUserId: string | undefined;
  onPromoteUser: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  isPromoting: boolean;
  isRemoving: boolean;
}

const UserPromotionCard = ({
  user,
  currentUserId,
  onPromoteUser,
  onRemoveAdmin,
  isPromoting,
  isRemoving,
}: UserPromotionCardProps) => {
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [showCreditInput, setShowCreditInput] = useState(false);
  const queryClient = useQueryClient();

  // Grant credits mutation
  const grantCreditsMutation = useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: {
      userId: string;
      amount: number;
    }) => {
      const { data, error } = await supabase.rpc("grant_user_credits", {
        target_user_id: userId,
        credit_amount: amount,
        description: `Admin granted ${amount} credits`,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Credits granted successfully");
      setCreditAmount("");
      setShowCreditInput(false);
    },
    onError: (error) => {
      toast.error("Failed to grant credits: " + error.message);
    },
  });

  const handleGrantCredits = () => {
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }
    grantCreditsMutation.mutate({ userId: user.id, amount });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-600">
            {user.email || "Unknown User"}
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <Badge
              variant={user.role === "admin" ? "destructive" : "secondary"}
            >
              {user.role || "user"}
            </Badge>
            <span className="text-xs text-gray-500">
              {user.property_count || 0} properties • {user.message_count || 0} messages
            </span>
          </div>
          {user.created_at && (
            <p className="text-xs text-gray-400 mt-1">
              Joined {format(new Date(user.created_at), "PPP")}
            </p>
          )}
        </div>

        <div className="ml-4 space-y-2">
          <div className="flex space-x-2">
            {user.role !== "admin" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPromoteUser(user.id)}
                disabled={isPromoting}
                className="flex items-center space-x-1"
              >
                <UserPlus className="h-3 w-3" />
                <span>Promote to Admin</span>
              </Button>
            ) : user.id !== currentUserId ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveAdmin(user.id)}
                disabled={isRemoving}
                className="flex items-center space-x-1"
              >
                <UserMinus className="h-3 w-3" />
                <span>Remove Admin</span>
              </Button>
            ) : (
              <Badge variant="outline">Current User</Badge>
            )}
          </div>

          <div className="flex space-x-2">
            {!showCreditInput ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreditInput(true)}
                className="flex items-center space-x-1"
              >
                <Coins className="h-3 w-3" />
                <span>Grant Credits</span>
              </Button>
            ) : (
              <div className="flex space-x-1">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-20 h-8"
                  min="1"
                />
                <Button
                  size="sm"
                  onClick={handleGrantCredits}
                  disabled={grantCreditsMutation.isPending}
                  className="h-8"
                >
                  Grant
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowCreditInput(false);
                    setCreditAmount("");
                  }}
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserPromotionCard;
