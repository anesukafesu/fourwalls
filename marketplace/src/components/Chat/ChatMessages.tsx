import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/contexts/ChatContext";
import { ChatMessage } from "@/components/Chat/ChatMessage";

const ChatMessages = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isTyping, messages } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-scroll flex flex-col h-full border-b border-gray-200 bg-white">
      <ScrollArea className="flex-1 h-full">
        <div className="p-6 space-y-4 min-h-full">
          {messages?.map((message, index) => {
            const previousMessage =
              index == 0 ? undefined : messages[index - 1];

            return (
              <ChatMessage
                key={message.id}
                message={message}
                previousMessage={previousMessage}
              />
            );
          })}

          {isTyping && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-300 text-gray-700">
                  ...
                </AvatarFallback>
              </Avatar>
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
