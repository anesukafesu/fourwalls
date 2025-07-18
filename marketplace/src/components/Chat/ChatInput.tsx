import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Property } from "@/types/property";
import PropertyAttachModal from "./PropertyAttachModal";

const ChatInput = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    currentSession,
    handleSendMessage,
    isTyping,
    currentSessionId,
    isAIChat,
    profile,
  } = useChat();
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [inputMessage, setInputMessage] = useState("");


  // Get the other user's ID for property search
  const otherUserId =
    currentSession?.user_two === null
      ? null
      : currentSession?.user_one === currentSession?.user_two
      ? currentSession?.user_one
      : currentSession?.user_two;

  const handlePropertyAttach = (property: Property) => {
    const propertyTag = `<%${property.id}%>`;
    setInputMessage(inputMessage + propertyTag);
    setShowAttachModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isTyping) {
      handleSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  if (!(user && currentSessionId)) return null;

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 flex items-center px-4 py-3 gap-3 hover:border-[#8B5C2A] transition-colors duration-200"
      >
        {!isAIChat && otherUserId && (
          <Button
            type="button"
            onClick={() => setShowAttachModal(true)}
            variant="outline"
            size="icon"
            className="flex-shrink-0 border-gray-300 text-gray-600 hover:bg-[#8B5C2A] hover:text-white hover:border-[#8B5C2A] transition-colors duration-200"
            title="Attach property"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}
        
        <Input
          className="flex-1 border-0 focus-visible:ring-0 text-base bg-transparent outline-none placeholder:text-gray-500"
          placeholder={
            isAIChat ? "Ask Scout about properties..." : "Type your message..."
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isTyping}
          autoFocus
        />
        
        <Button
          type="submit"
          className="h-10 w-10 p-0 rounded-full flex items-center justify-center bg-[#8B5C2A] hover:bg-[#7A4F24] transition-colors duration-200"
          disabled={
            !inputMessage.trim() ||
            isTyping ||
            (isAIChat && (!profile || profile.credits < 1))
          }
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      {isAIChat && profile && profile.credits < 1 && (
        <p className="text-sm text-red-600 mt-2 text-center">
          You have no credits remaining. Contact an admin to get more credits.
        </p>
      )}

      <PropertyAttachModal
        open={showAttachModal}
        onOpenChange={setShowAttachModal}
        sessionId={currentSessionId}
        onSelectProperty={handlePropertyAttach}
      />
    </div>
  );
};

export default ChatInput;
