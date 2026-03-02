import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageWindow = () => {
  const messages = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `This i a long Message content.This i a long Message content.This i a long Message content.This i a long Message content.This i a long Message content.${i + 1}`,
    side: i % 2 === 0 ? "right" : "left",
  }));

  return (
    <div className={`w-full h-[calc(100vh-12.50rem)] flex-1`}>
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-sm wrap-break-word ${
                msg.side === "right"
                  ? "self-end bg-primary text-secondary font-medium"
                  : "self-start bg-secondary text-primary font-medium"
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
