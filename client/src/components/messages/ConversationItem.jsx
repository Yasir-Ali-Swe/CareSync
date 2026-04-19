import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ConversationItem = ({ title, subtitle, avatarUrl, unreadCount = 0, isActive = false }) => {
  const fallback = String(title || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`w-full overflow-hidden flex items-center gap-2 border-b p-2 hover:bg-muted cursor-pointer ${
        isActive ? "bg-muted" : ""
      }`}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-primary truncate">{title || "Conversation"}</h1>
        <p className="text-xs text-muted-foreground w-full line-clamp-1">
          {subtitle || "No messages yet"}
        </p>
      </div>
      {unreadCount > 0 ? (
        <Badge className="h-5 min-w-5 px-1.5 text-[10px] rounded-full">{unreadCount}</Badge>
      ) : null}
    </div>
  );
};

export default ConversationItem;
