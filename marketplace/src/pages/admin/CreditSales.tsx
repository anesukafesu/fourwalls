
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { format } from 'date-fns';

const AdminCreditSales = () => {
  // Fetch all credit transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-credit-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          *,
          profiles!credit_transactions_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    if (!transactions) return null;

    const totalRevenue = transactions
      .filter(t => t.transaction_type === 'admin_grant' && t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalCreditsGranted = transactions
      .filter(t => t.transaction_type === 'admin_grant')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalUsage = transactions
      .filter(t => t.transaction_type === 'chat_usage')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const uniqueUsers = new Set(transactions.map(t => t.user_id)).size;

    return {
      totalRevenue,
      totalCreditsGranted,
      totalUsage,
      uniqueUsers
    };
  }, [transactions]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'admin_grant':
        return 'bg-green-100 text-green-800';
      case 'chat_usage':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'admin_grant':
        return 'Credit Purchase';
      case 'chat_usage':
        return 'Credit Usage';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                RWF {summaryStats?.totalRevenue.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Granted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats?.totalCreditsGranted.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats?.totalUsage.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats?.uniqueUsers || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">
                          {transaction.profiles?.full_name || transaction.profiles?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.profiles?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </Badge>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {transactions && transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No transactions found.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default AdminCreditSales;
