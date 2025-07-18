import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Coins } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ChatHeader = () => {
  const { getChatDisplayName, isAIChat, currentSession, profile } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUserNameClick = () => {
    if (!currentSession || !user || isAIChat) return;

    const isUserOne = currentSession.user_one === user.id;
    const otherUserId = isUserOne
      ? currentSession.user_two
      : currentSession.user_one;

    if (otherUserId) {
      navigate(`/profile/${otherUserId}`);
    }
  };

  const handleBuyCredits = () => {
    navigate("/credits");
  };

  return (
    <CardHeader className="border-b border-gray-200 py-4 px-6 bg-white rounded-t-lg h-full">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-3 text-gray-800">
          <div className="p-2 rounded-lg bg-gray-100">
            {isAIChat ? (
              <Bot className="h-5 w-5 text-blue-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <button
            onClick={handleUserNameClick}
            className="text-gray-800 hover:text-blue-600 transition-colors text-lg font-semibold"
            disabled={isAIChat || !currentSession}
          >
            {getChatDisplayName()}
          </button>
        </CardTitle>

        {isAIChat && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span>{profile?.credits || 0} credits</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBuyCredits}
              className="bg-gray-100 border-none text-gray-700 hover:bg-gray-50"
            >
              Buy More
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
