import React from "react";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const MessageInput = () => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("Selected file:", file);
  };
  return (
    <div className="flex items-center justify-between gap-2 w-full h-15 p-2 border-t-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={handleFileClick}
      >
        <Paperclip className="size-5 text-muted-foreground" />
      </Button>
      <Input
        className="flex-1 rounded-full text-primary"
        placeholder="Type a message..."
      />
      <Button type="submit" size="icon" variant="outline" className={"p-0"}>
        <Send className="size-5 text-primary cursor-pointer" />
      </Button>
    </div>
  );
};

export default MessageInput;
