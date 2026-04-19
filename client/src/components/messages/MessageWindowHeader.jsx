import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MessageWindowHeader = ({ conversation, currentUserId }) => {
  const otherParticipant = (conversation?.participants || []).find(
    (participant) => String(participant?._id) !== String(currentUserId),
  );

  const displayName = otherParticipant?.fullName || "Conversation";
  const fallback = String(displayName)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-b-2 h-15 w-full flex items-center justify-between">
      <div className="flex items-center gap-2 p-2">
        <Link
          to="/messages"
          className="lg:hidden mr-1 p-1 hover:bg-accent rounded-full"
        >
          <ArrowLeft className="size-5 text-muted-foreground" />
        </Link>
        <Avatar className="size-9">
          <AvatarImage src={otherParticipant?.profileImageUrl || undefined} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-primary truncate">{displayName}</h1>
          <p className="text-xs text-muted-foreground">{conversation ? "Conversation" : "Select a chat"}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mx-4">
        <Phone className="size-5 text-muted-foreground cursor-pointer" />
        <Video className="size-5 text-muted-foreground cursor-pointer mx-2" />
      </div>
    </div>
  );
};

export default MessageWindowHeader;
