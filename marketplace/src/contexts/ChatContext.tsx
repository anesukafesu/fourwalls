import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useSearchParams } from "react-router-dom";
import { Message } from "@/types/message";
import { Profile } from "@/types/profile";
import { ChatContextType } from "@/types/chatContext";
import { toast } from "sonner";
import { useServices } from "./ServicesContext";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const chatUrl = `${services?.["CHAT"]}/chat`;

  const {
    sessions,
    isLoading: sessionsLoading,
    createSession,
  } = useChatSessions();

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || !user || !currentSessionId) return;

    const currentSession = sessions?.find((s) => s.id === currentSessionId);
    const isAIChat = currentSession?.user_two === null;

    if (isAIChat && (!profile || profile.credits < 1)) {
      uiToast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to send a message to the AI.",
        variant: "destructive",
      });
      return;
    }

    setIsTyping(true);
    setInputMessage("");

    try {
      const accessToken = (await supabase.auth.getSession()).data.session
        ?.access_token;

      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          chat_id: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      queryClient.invalidateQueries({
        queryKey: ["chat-messages", currentSessionId],
      });
    } catch (error) {
      console.error("Error in chat:", error);
      uiToast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const sessionFromUrl = searchParams.get("session");
    const prefillFromUrl = searchParams.get("prefill");

    if (sessionFromUrl) {
      if (sessionFromUrl === "ai") {
        const aiSession = sessions?.find((s) => s.user_two === null);

        setCurrentSessionId(aiSession.id);
        if (prefillFromUrl) {
          setTimeout(() => {
            handleSendMessage(prefillFromUrl);
          }, 1000);
        }
        
      } else {
        const sessionExists = sessions?.some((s) => s.id === sessionFromUrl);
        if (!sessionExists) {
          uiToast({
            title: "Chat Not Found",
            description: "The specified chat session does not exist.",
            variant: "destructive",
          });
          return;
        }
        setCurrentSessionId(sessionFromUrl);
      }
    }
  }, [searchParams, sessions]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat-messages", currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_session_id", currentSessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!currentSessionId,
  });

  useEffect(() => {
    if (currentSessionId && user) {
      const markAsRead = async () => {
        try {
          await supabase.rpc("mark_messages_as_read", {
            session_id: currentSessionId,
          });
          queryClient.invalidateQueries({
            queryKey: ["unread-counts", user.id],
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      };
      markAsRead();
    }
  }, [currentSessionId, user, queryClient]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          if (newMessage.sent_by !== user.id && newMessage.sent_by !== null) {
            const { data: senderProfile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", newMessage.sent_by)
              .single();

            const senderName =
              senderProfile?.full_name || senderProfile?.email || "Someone";

            toast(`New message from ${senderName}`, {
              description:
                newMessage.message.substring(0, 100) +
                (newMessage.message.length > 100 ? "..." : ""),
            });
          }

          queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
          queryClient.invalidateQueries({
            queryKey: ["unread-counts", user.id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createAISessionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_one: user.id,
          user_two: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", user?.id] });
      setCurrentSessionId(data.id);
    },
  });

  const findAISession = () => sessions?.find((s) => s.user_two === null);

  useEffect(() => {
    if (user && sessions && sessions.length > 0) {
      const aiSession = findAISession();
      if (!(aiSession || createAISessionMutation.isPending)) {
        createAISessionMutation.mutate();
      } else if (
        aiSession &&
        !currentSessionId &&
        !searchParams.get("session")
      ) {
        setCurrentSessionId(aiSession.id);
      }
    } else if (
      user &&
      sessions &&
      sessions.length === 0 &&
      !sessionsLoading &&
      !createAISessionMutation.isPending
    ) {
      createAISessionMutation.mutate();
    }
  }, [user, sessions, sessionsLoading, currentSessionId, searchParams]);

  const currentSession = sessions?.find((s) => s.id === currentSessionId);
  const isAIChat = currentSession?.user_two === null;

  const getChatDisplayName = () => {
    if (!currentSession || !user) return "Chat";

    if (currentSession.user_two === null) {
      return "Scout";
    }

    const isUserOne = currentSession.user_one === user.id;
    const otherUserProfile = isUserOne
      ? currentSession.user_two_profile
      : currentSession.user_one_profile;

    return (
      otherUserProfile?.full_name || otherUserProfile?.email || "Unknown User"
    );
  };

  const { data: profiles } = useQuery({
    queryKey: ["chat-profiles", currentSessionId],
    queryFn: async () => {
      if (!messages) return [];
      const userIds = [...new Set(messages.map((m) => m.sent_by))];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      if (error) throw error;
      return data;
    },
    enabled: !!messages && messages.length > 0,
  });

  const value = {
    currentSessionId,
    setCurrentSessionId,
    inputMessage,
    setInputMessage,
    isTyping,
    messages,
    isLoading,
    profile,
    sessions: sessions || [],
    sessionsLoading,
    scrollAreaRef,
    handleSendMessage,
    getChatDisplayName,
    isAIChat,
    currentSession,
    profiles,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
