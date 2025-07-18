
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAIChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendAIMessage = useMutation({
    mutationFn: async ({ 
      sessionId, 
      message 
    }: { 
      sessionId: string; 
      message: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Send user message
      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert({
          sent_by: user.id,
          chat_session_id: sessionId,
          message: message,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Generate AI response (simplified for demo)
      const aiResponse = `Thank you for your message: "${message}". This is a demo AI response. In a real implementation, this would connect to an AI service like OpenAI or similar.`;

      // Send AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert({
          sent_by: 'ai-assistant',
          chat_session_id: sessionId,
          message: aiResponse,
        })
        .select()
        .single();

      if (aiError) throw aiError;

      return { userMessage, aiMessage };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', data.userMessage.chat_session_id] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to send message: ' + error.message);
    },
  });

  return {
    sendAIMessage: sendAIMessage.mutate,
    isSending: sendAIMessage.isPending,
  };
};
