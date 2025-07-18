import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatSession } from "@/types/chatSession";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ChatSidebar = () => {
  const { user } = useAuth();
  const { sessions, currentSessionId, setCurrentSessionId, sessionsLoading } =
    useChat();

  // Query to get unread message counts for each session
  const { data: unreadCounts } = useQuery({
    queryKey: ["unread-counts", user?.id],
    queryFn: async () => {
      if (!user) return {};

      const { data, error } = await supabase
        .from("chat_messages")
        .select("chat_session_id, is_read")
        .neq("sent_by", user.id)
        .eq("is_read", false);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((message) => {
        counts[message.chat_session_id] =
          (counts[message.chat_session_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const getDisplayName = (session: ChatSession) => {
    if (session.user_two === null) {
      return "Scout";
    }
    const otherUserProfile =
      session.user_one === user?.id
        ? session.user_two_profile
        : session.user_one_profile;
    return (
      otherUserProfile?.full_name || otherUserProfile?.email || "Unknown User"
    );
  };

  const getAvatarUrl = (session: ChatSession) => {
    if (session.user_two === null) return null;
    const otherUserProfile =
      session.user_one === user?.id
        ? session.user_two_profile
        : session.user_one_profile;
    return otherUserProfile?.avatar_url || null;
  };

  const getAvatarFallback = (session: ChatSession) => {
    if (session.user_two === null) return "S";
    const otherUserProfile =
      session.user_one === user?.id
        ? session.user_two_profile
        : session.user_one_profile;
    const name = otherUserProfile?.full_name || otherUserProfile?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  const hasUnreadMessages = (sessionId: string) => {
    return (unreadCounts?.[sessionId] || 0) > 0;
  };

  // Sort sessions to put AI chat first
  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => {
        if (a.user_two === null && b.user_two !== null) return -1;
        if (a.user_two !== null && b.user_two === null) return 1;
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      })
    : [];

  return (
    <div
      className={`flex flex-col bg-white border border-gray-200 rounded-lg transition-all duration-300 h-full w-full`}
    >
      <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-600">Conversations</h2>
      </div>

      <ScrollArea className="flex-1 p-2">
        {sessionsLoading ? (
          <div className="text-center text-gray-500 p-4">Loading...</div>
        ) : sortedSessions && sortedSessions.length > 0 ? (
          <div className="space-y-2">
            {sortedSessions.map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className={`w-full justify-start text-left h-auto p-3 rounded-lg transition-colors duration-200 ${
                  currentSessionId === session.id
                    ? "bg-[#8B5C2A]/10 text-[#8B5C2A]"
                    : "text-gray-700 hover:bg-[#8B5C2A]/5 hover:text-[#8B5C2A]"
                } ${
                  hasUnreadMessages(session.id)
                    ? "ring-2 ring-blue-500 ring-opacity-50"
                    : ""
                }`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    {session.user_two === null ? (
                      <AvatarFallback className="bg-[#8B5C2A] text-white">
                        S
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={getAvatarUrl(session) || ""} />
                        <AvatarFallback className="bg-gray-300 text-gray-700">
                          {getAvatarFallback(session)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  {hasUnreadMessages(session.id) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 ml-3">
                  <div
                    className={`truncate ${
                      hasUnreadMessages(session.id)
                        ? "font-bold"
                        : "font-medium"
                    }`}
                  >
                    {getDisplayName(session)}
                  </div>
                  {hasUnreadMessages(session.id) && (
                    <div className="text-xs text-blue-600 font-medium">
                      {unreadCounts?.[session.id]} new message
                      {(unreadCounts?.[session.id] || 0) > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 p-4">
            No chat sessions yet
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
