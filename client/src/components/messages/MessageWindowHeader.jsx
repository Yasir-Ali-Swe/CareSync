import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
const MessageWindowHeader = () => {
  return (
    <div className="border-b h-15 w-full flex items-center justify-between">
      <div className="flex items-center gap-2 p-2">
        <Link
          to="/messages"
          className="lg:hidden mr-1 p-1 hover:bg-accent rounded-full"
        >
          <ArrowLeft className="size-5 text-muted-foreground" />
        </Link>
        <Avatar className="size-9">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>YA</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-primary truncate">
            Yasir Ali
          </h1>
          <p className="text-sm font-semibold text-green-900 animate-pulse">typing...</p>
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
