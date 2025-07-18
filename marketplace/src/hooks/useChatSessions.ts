
import { useChatSessionsQuery } from './useChatSessionsQuery';
import { useChatMutations } from './useChatMutations';

export const useChatSessions = () => {
  const { data: sessions, isLoading } = useChatSessionsQuery();
  const { 
    createSession, 
    isCreating, 
    startAIChat, 
    isStartingAIChat, 
    startAgentChatMutation 
  } = useChatMutations();

  // Wrapper function for startAgentChat with options
  const startAgentChat = (
    params: { agentId: string; propertyId: string; propertyTitle: string },
    options?: { onSuccess?: (sessionId: string) => void; onError?: (error: Error) => void }
  ) => {
    startAgentChatMutation.mutate(params, {
      onSuccess: (session) => {
        if (options?.onSuccess) {
          options.onSuccess(session.id);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error as Error);
        }
      }
    });
  };

  return {
    sessions,
    isLoading,
    createSession,
    isCreating,
    startAIChat,
    isStartingAIChat,
    startAgentChat,
    isStartingAgentChat: startAgentChatMutation.isPending,
  };
};
