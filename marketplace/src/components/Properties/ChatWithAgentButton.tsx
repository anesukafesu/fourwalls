
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatWithAgentButtonProps {
  propertyId: string;
  propertyTitle: string;
  agentId?: string | null;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

const ChatWithAgentButton = ({ 
  propertyId, 
  propertyTitle, 
  agentId, 
  variant = 'default',
  size = 'default'
}: ChatWithAgentButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startAgentChat, isStartingAgentChat } = useChatSessions();

  // Don't show button if user is not logged in, no agent, or user is the agent
  if (!user || !agentId || user.id === agentId) return null;

  const handleChatWithAgent = () => {
    startAgentChat(
      { agentId, propertyId, propertyTitle },
      {
        onSuccess: (sessionId) => {
          console.log('Chat session created/found with ID:', sessionId);
          navigate(`/chat?session=${sessionId}`);
        },
        onError: (error) => {
          console.error('Failed to start chat with agent:', error);
        }
      }
    );
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleChatWithAgent}
      disabled={isStartingAgentChat}
      className="flex items-center space-x-2 w-full"
    >
      <MessageSquare className="h-4 w-4" />
      <span>{isStartingAgentChat ? 'Starting chat...' : 'Chat with Agent'}</span>
    </Button>
  );
};

export default ChatWithAgentButton;
