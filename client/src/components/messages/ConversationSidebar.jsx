import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConversationItem from "@/components/messages/ConversationItem";
import { Hospital } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const ConversationSidebar = ({ className }) => {
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`,
  );
  return (
    <div className={className || "w-full lg:w-1/4 border-r-2"}>
      <div className="h-25 p-3 border-b-2">
        <div className="flex items-center gap-1">
          <h1 className="text-primary font-bold text-lg">CareSync</h1>
          <Hospital className="size-6" />
        </div>
        <Input
          type="text"
          placeholder="Search conversations..."
          className="mt-2 rounded-full"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-6.25rem)]">
        {tags.map((tag) => (
          <div key={tag} className="px-3">
            <Link to={`/messages/${tag}`}>
              <ConversationItem />
            </Link>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
