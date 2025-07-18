import { useState } from 'react';
import { Block, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockUserButtonProps {
  userId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

const BlockUserButton = ({ userId, variant = 'outline', size = 'sm' }: BlockUserButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isBlocked } = useQuery({
    queryKey: ['user-blocked', userId],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .single();
      return !!data;
    },
    enabled: !!user && user.id !== userId,
  });

  const blockUserMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Authentication required');
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocked', userId] });
      toast.success('User blocked successfully');
    },
    onError: (error) => {
      toast.error('Failed to block user: ' + error.message);
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Authentication required');
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocked', userId] });
      toast.success('User unblocked successfully');
    },
    onError: (error) => {
      toast.error('Failed to unblock user: ' + error.message);
    },
  });

  if (!user || user.id === userId) {
    return null;
  }

  const handleClick = () => {
    if (isBlocked) {
      unblockUserMutation.mutate();
    } else {
      blockUserMutation.mutate();
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
      disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
    >
      <UserX className="h-4 w-4 mr-1" />
      {isBlocked ? 'Unblock' : 'Block'} User
    </Button>
  );
};

export default BlockUserButton;