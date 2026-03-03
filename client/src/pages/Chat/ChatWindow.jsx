import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatWindow = () => {
  const messages = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `Hey, how are you doing today? This message is very long and should not
          break the UI at all.This message is very long and should not
          break the UI at all.`,
    side: i % 2 === 0 ? "right" : "left",
  }));

  return (
    <div className={`w-full h-[calc(100vh-12.50rem)] flex-1`}>
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg wrap-break-word ${
                msg.side === "right"
                  ? "self-end bg-primary text-secondary font-normal"
                  : "self-start bg-secondary text-primary font-normal"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatWindow;
