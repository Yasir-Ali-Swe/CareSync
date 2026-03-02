import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ConversationSidebar from "../messages/ConversationSidebar";
import MessageInput from "../messages/MessageInput";
import MessageWindowHeader from "../messages/MessageWindowHeader";

const ChatLayout = () => {
  const { conversationId } = useParams();
  return (
    <div className="flex h-screen">
      <ConversationSidebar />
      <div className="flex-1 flex flex-col">
        {conversationId && <MessageWindowHeader />}
        <Outlet />
        {conversationId && <MessageInput />}
      </div>
    </div>
  );
};

export default ChatLayout;
