import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ConversationSidebar from "../messages/ConversationSidebar";
import MessageInput from "../messages/MessageInput";
import MessageWindowHeader from "../messages/MessageWindowHeader";

const ChatLayout = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen w-full">
      <ConversationSidebar
        className={`${conversationId ? "hidden lg:block lg:w-1/4" : "block w-full lg:w-1/4"} border-r-4 border-border h-full`}
      />
      <div
        className={`${conversationId ? "flex flex-col w-full" : "hidden lg:flex flex-col"} flex-1 h-full`}
      >
        {conversationId ? <MessageWindowHeader /> : null}
        <Outlet />
        {conversationId ? <MessageInput /> : null}
      </div>
    </div>
  );
};

export default ChatLayout;
