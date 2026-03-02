import React from "react";
import ConversationSidebar from "@/components/messages/ConversationSidebar";
import MessageWindowHeader from "@/components/messages/MessageWindowHeader";
import MessageInput from "@/components/messages/MessageInput";
import MessageWindow from "@/components/messages/MessageWindow";

const MessagesPgae = () => {
  return (
    <div className="h-screen flex">
      <ConversationSidebar />
      <div className="flex-1 flex flex-col ">
        <MessageWindowHeader />
        <MessageWindow className="flex-1" />
        <MessageInput />
      </div>
    </div>
  );
};

export default MessagesPgae;
