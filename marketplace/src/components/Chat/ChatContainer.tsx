
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

const ChatContainer = () => {
  const [searchParams] = useSearchParams();
  const { handleSendMessage, currentSessionId } = useChat();

  useEffect(() => {
    const prefillMessage = searchParams.get("prefill");
    const sessionType = searchParams.get("session");
    
    if (prefillMessage && currentSessionId && sessionType === "ai") {
      // Send the prefilled message immediately for AI chat
      const timer = setTimeout(() => {
        // handleSendMessage(decodeURIComponent(prefillMessage));
      }, 500); // Small delay to ensure chat is ready
      
      return () => clearTimeout(timer);
    }
  }, [handleSendMessage]);

  return (
    <div className="w-full min-h-full bg-gray-200 flex flex-col">
      <div className="h-[80px]">
        <ChatHeader />
      </div>
      <div className="flex-1 h-full overflow-y-auto">
        <ChatMessages />
      </div>
      <div className="h-[100px]">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;
