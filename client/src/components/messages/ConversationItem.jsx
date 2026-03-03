import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ConversationItem = () => {
  return (
    <div className="w-full overflow-hidden flex items-center gap-2 border-b p-2 hover:bg-muted cursor-pointer">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>YA</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-primary truncate">
          Yasir Ali
        </h1>
        <p className="text-xs text-muted-foreground w-full line-clamp-1">
          Hey, how are you doing today? This message is very long and should not
          break the UI at all.This message is very long and should not
          break the UI at all.
        </p>
      </div>
    </div>
  );
};

export default ConversationItem;
