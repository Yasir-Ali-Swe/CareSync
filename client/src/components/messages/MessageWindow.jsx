import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageWindow = ({ className }) => {
  // Generate 100 dummy messages
  const messages = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `This is message number ${i + 1}`,
    side: i % 2 === 0 ? "right" : "left", // Alternate sides
  }));

  return (
    <div className={`w-full h-[calc(100vh-12.50rem)] ${className}`}>
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.side === "right"
                  ? "self-end bg-blue-500 text-white"
                  : "self-start bg-gray-200 text-gray-900"
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
