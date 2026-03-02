import React from "react";
import { MessageCirclePlus } from "lucide-react";

const ChatWindowPlaceholder = ({ className }) => {
  return (
    <div
      className={`w-full h-full ${className} flex items-center justify-center`}
    >
      <div className="px-6 h-50 w-auto bg-secondary rounded-sm flex flex-col items-center justify-center gap-4">
        <MessageCirclePlus className="size-16 text-primary" />
        <p className="text-lg text-primary font-semibold">
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  );
};

export default ChatWindowPlaceholder;
