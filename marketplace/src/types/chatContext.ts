
import { Message } from "./message";
import { Profile } from "./profile";
import { Property } from "./property";

export interface ChatContextType {
  currentSessionId: string | null;
  setCurrentSessionId: (id: string) => void;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isTyping: boolean;
  messages: Message[] | undefined;
  isLoading: boolean;
  profile: Profile | null | undefined;
  sessions: any[];
  sessionsLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (messageText?: string) => void;
  getChatDisplayName: () => string;
  isAIChat: boolean;
  currentSession: any;
}
