import { useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import SigninRequired from "@/components/Chat/SigninRequired";
import ChatSidebar from "@/components/Chat/ChatSidebar";
import ChatHeader from "@/components/Chat/ChatHeader";
import ChatInput from "@/components/Chat/ChatInput";
import ChatMessages from "@/components/Chat/ChatMessages";

const ChatContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <SigninRequired />;
  }

  return (
    <div
      className="max-w-7xl mx-auto w-full overflow-hidden flex gap-4"
      style={{ height: "calc(100vh - 100px)" }}
    >
      {/* Left scrollable panel */}
      <div className="w-[500px] min-h-full p-0 overflow-y-auto overflow-x-hidden">
        <ChatSidebar />
      </div>

      {/* Right scrollable panel */}
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
    </div>
  );
};

const Chat = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
