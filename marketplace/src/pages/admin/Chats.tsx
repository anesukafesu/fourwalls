import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, User, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface ChatSession {
  id: string;
  created_at: string;
  updated_at: string;
  user_one: string;
  user_two: string | null;
  profiles_user_one?: Profile;
  profiles_user_two?: Profile;
  message_count?: number;
  last_message?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  sent_by: string | null;
  profiles?: Profile;
}

const AdminChats = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Fetch users with chat sessions
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-chat-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url
        `)
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch chat sessions for selected user
  const { data: chatSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-user-chats', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *
        `)
        .or(`user_one.eq.${selectedUser},user_two.eq.${selectedUser}`)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately to avoid foreign key issues
      const sessionsWithProfiles = await Promise.all(
        data.map(async (session) => {
          const { data: userOneProfile } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', session.user_one)
            .single();
            
          let userTwoProfile = null;
          if (session.user_two) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url')
              .eq('id', session.user_two)
              .single();
            userTwoProfile = profile;
          }
          
          return {
            ...session,
            profiles_user_one: userOneProfile,
            profiles_user_two: userTwoProfile
          };
        })
      );
      
      if (error) throw error;

      // Get message counts for each session
      const sessionsWithCounts = await Promise.all(
        sessionsWithProfiles.map(async (session) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_session_id', session.id);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message')
            .eq('chat_session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...session,
            message_count: count || 0,
            last_message: lastMessage?.message || 'No messages yet'
          };
        })
      );

      return sessionsWithCounts;
    },
    enabled: !!selectedUser,
  });

  // Fetch messages for selected chat session
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-chat-messages', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`*`)
        .eq('chat_session_id', selectedSession)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Fetch profiles for each message
      const messagesWithProfiles = await Promise.all(
        data.map(async (message) => {
          if (!message.sent_by) {
            return { ...message, profiles: null };
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', message.sent_by)
            .single();
            
          return { ...message, profiles: profile };
        })
      );
      
      return messagesWithProfiles;
      
    },
    enabled: !!selectedSession,
  });

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOtherParticipant = (session: ChatSession, currentUserId: string) => {
    if (session.user_one === currentUserId) {
      return session.user_two ? session.profiles_user_two : null;
    } else {
      return session.profiles_user_one;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat Management</h1>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Users List */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Users
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-120px)] overflow-y-auto">
              {usersLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-2">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers?.map((user) => (
                    <Button
                      key={user.id}
                      variant={selectedUser === user.id ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => {
                        setSelectedUser(user.id);
                        setSelectedSession(null);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-medium text-sm">
                            {user.full_name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Sessions */}
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Sessions
                {selectedUser && (
                  <Badge variant="secondary" className="ml-2">
                    {chatSessions?.length || 0}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              {!selectedUser ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a user to view their chat sessions
                </div>
              ) : sessionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse p-3 border rounded">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : chatSessions?.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No chat sessions found
                </div>
              ) : (
                <div className="space-y-2">
                  {chatSessions?.map((session) => {
                    const otherParticipant = getOtherParticipant(session, selectedUser);
                    const isAIChat = !session.user_two;
                    
                    return (
                      <Button
                        key={session.id}
                        variant={selectedSession === session.id ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <Avatar className="h-8 w-8 mt-1">
                            {isAIChat ? (
                              <AvatarFallback>AI</AvatarFallback>
                            ) : (
                              <>
                                <AvatarImage src={otherParticipant?.avatar_url || ''} />
                                <AvatarFallback>
                                  {otherParticipant?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">
                              {isAIChat ? 'AI Assistant' : (otherParticipant?.full_name || 'Unknown User')}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {session.last_message}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {session.message_count} messages
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Messages
                {selectedSession && (
                  <Badge variant="secondary" className="ml-2">
                    {messages?.length || 0}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              {!selectedSession ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a chat session to view messages
                </div>
              ) : messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages in this chat
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        {message.sent_by ? (
                          <>
                            <AvatarImage src={message.profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              {message.profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback>AI</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sent_by 
                              ? (message.profiles?.full_name || 'Unknown User')
                              : 'AI Assistant'
                            }
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm bg-gray-50 p-3 rounded-md">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChats;