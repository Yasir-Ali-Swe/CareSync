import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageWindow = () => {
  const messages = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `This is message number ${i + 1}`,
    side: i % 2 === 0 ? "right" : "left",
  }));

  return (
    <div className={`w-full h-[calc(100vh-12.50rem)] flex-1`}>
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.side === "right"
                  ? "self-end bg-primary text-secondary"
                  : "self-start bg-secondary text-primary"
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

export default MessageWindow;
