
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatSession {
  id: string;
  user_one: string;
  user_two: string | null;
  created_at: string;
  updated_at: string;
}

export const useChatMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async ({ 
      participantId
    }: { 
      participantId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_one: user.id,
          user_two: participantId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to create chat session: ' + error.message);
    },
  });

  // Start AI chat
  const startAIChatMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_one: user.id,
          user_two: null,
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Create initial AI welcome message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: session.id,
          sent_by: 'ai-assistant',
          message: 'Hello! I\'m your AI assistant. How can I help you today?',
        });

      if (messageError) throw messageError;

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', user?.id] });
      toast.success('AI chat started!');
    },
    onError: (error) => {
      toast.error('Failed to start AI chat: ' + error.message);
    },
  });

  // Start chat with agent or find existing one
  const startAgentChatMutation = useMutation({
    mutationFn: async ({ 
      agentId, 
      propertyId, 
      propertyTitle 
    }: { 
      agentId: string; 
      propertyId: string; 
      propertyTitle: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First, check if a chat session already exists between these two users
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .or(`and(user_one.eq.${user.id},user_two.eq.${agentId}),and(user_one.eq.${agentId},user_two.eq.${user.id})`)
        .single();

      let session = existingSession;

      if (!existingSession) {
        // Create new chat session with agent
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            user_one: user.id,
            user_two: agentId,
          })
          .select()
          .single();
        
        if (sessionError) throw sessionError;
        session = newSession;
      }

      // Create the property inquiry message
      const propertyMessage = `Hi! I'm interested in your property: ${propertyTitle}. Could you tell me more about it?`;
      
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          sent_by: user.id,
          chat_session_id: session.id,
          message: propertyMessage,
          featured_property_id: propertyId,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', user?.id] });
      toast.success('Chat with agent started!');
    },
    onError: (error) => {
      toast.error('Failed to start chat with agent: ' + error.message);
    },
  });

  return {
    createSession: createSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
    startAIChat: startAIChatMutation.mutate,
    isStartingAIChat: startAIChatMutation.isPending,
    startAgentChatMutation,
  };
};
