
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Plus, History, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Credits = () => {
  const { user } = useAuth();
  const [creditAmount, setCreditAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["credit-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePurchase = async () => {
    if (!creditAmount || !phoneNumber) {
      toast.error('Please enter both credit amount and phone number');
      return;
    }

    const credits = parseInt(creditAmount);
    if (credits <= 0) {
      toast.error('Credit amount must be greater than 0');
      return;
    }

    const totalCost = credits * 50; // 50 RWF per credit
    
    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would integrate with MoMo API here
      toast.success(`Purchase initiated: ${credits} credits for RWF ${totalCost.toLocaleString()}. Please complete payment on your phone.`);
      
      setCreditAmount('');
      setPhoneNumber('');
    } catch (error) {
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view your credits.</p>
      </div>
    );
  }

  const credits = parseInt(creditAmount) || 0;
  const totalCost = credits * 50;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-600 mb-2">Credits</h1>
          <p className="text-gray-600">
            Manage your credits for using the chat feature
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Available Credits
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {profile?.credits || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Used for chat messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Buy More Credits
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="credits">Number of Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  placeholder="Enter number of credits"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="phone">MoMo Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+250 XXX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              {credits > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Total Cost: RWF {totalCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600">
                    Rate: 50 RWF per credit
                  </p>
                </div>
              )}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handlePurchase}
                disabled={isProcessing || !creditAmount || !phoneNumber}
              >
                {isProcessing ? 'Processing...' : 'Buy Credits'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-600">
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-600">
                        {transaction.transaction_type === "chat_usage"
                          ? "Chat Message"
                          : transaction.transaction_type === "admin_grant"
                          ? "Admin Grant"
                          : "Credit Transaction"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.created_at), "PPP")}
                      </p>
                    </div>
                    <div
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No transactions yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Credits;
