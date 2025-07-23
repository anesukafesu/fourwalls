
import { Message } from "@/types/message";
import MarkdownRenderer from "@/components/Chat/MarkdownRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shouldShowDateMarker } from "@/lib/shouldShowDateMarker";
import { formatDateMarker } from "@/lib/formatDateMarker";
import { formatMessageDate } from "@/lib/formatMessageDate";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageProps {
  message: Message;
  previousMessage: Message | undefined;
}

export function ChatMessage({ message, previousMessage }: ChatMessageProps) {
  const { profile } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnMessage = message.sent_by === user?.id;
  const showDateMarker = shouldShowDateMarker(message, previousMessage);

  // Fetch the sender's profile if it's not our own message
  const { data: senderProfile } = useQuery({
    queryKey: ["profile", message.sent_by],
    queryFn: async () => {
      if (!message.sent_by || message.sent_by === user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", message.sent_by)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!message.sent_by && message.sent_by !== user?.id,
  });

  const handleUserClick = (userId: string) => {
    if (userId !== user?.id) {
      navigate(`/profile/${userId}`);
    }
  };

  const displayProfile = isOwnMessage ? profile : senderProfile;
  const avatarUrl = displayProfile?.avatar_url || "";
  const displayName = displayProfile?.full_name || "User";

  return (
    <div>
      {/* Date Marker */}
      {showDateMarker && (
        <div className="flex justify-center my-6">
          <div className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200">
            {formatDateMarker(message.created_at)}
          </div>
        </div>
      )}

      {/* Message */}
      <div
        className={`flex gap-3 ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        {!isOwnMessage && (
          <button
            onClick={() => handleUserClick(message.sent_by)}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gray-300 text-gray-700">
                {displayName.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        )}

        <div className={`max-w-[70%] ${isOwnMessage ? "order-first" : ""}`}>
          <div
            className={`rounded-2xl px-4 py-3 border ${
              isOwnMessage
                ? "ml-auto bg-[#d58258] text-white border-[#d58258]"
                : "bg-white text-gray-800 border-gray-200"
            }`}
          >
            <div className="text-sm leading-relaxed">
              <MarkdownRenderer
                content={message.message}
                className={isOwnMessage ? "text-white" : "text-gray-800"}
              />
            </div>
            <p
              className={`text-xs mt-2 ${
                isOwnMessage ? "text-white/70" : "text-gray-500"
              }`}
            >
              {formatMessageDate(message.created_at)}
            </p>
          </div>
        </div>

        {isOwnMessage && (
          <button
            onClick={() => handleUserClick(message.sent_by)}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
            disabled={true}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gray-300 text-gray-700">
                {displayName.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </div>
  );
}
