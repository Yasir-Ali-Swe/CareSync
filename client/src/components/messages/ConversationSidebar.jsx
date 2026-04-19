import React, { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConversationItem from "@/components/messages/ConversationItem";
import { Hospital } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/services/chat.api";
import { useSelector } from "react-redux";

const ConversationSidebar = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { conversationId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?.id || user?._id;

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: chatApi.getConversations,
  });

  const conversations = conversationsQuery.data?.data?.conversations || [];

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (!term) return true;

      const otherParticipant = (conversation.participants || []).find(
        (participant) => String(participant?._id) !== String(currentUserId),
      );

      const participantName = String(otherParticipant?.fullName || "").toLowerCase();
      const messageText = String(conversation.lastMessage?.text || "").toLowerCase();

      return participantName.includes(term) || messageText.includes(term);
    });
  }, [conversations, currentUserId, searchTerm]);

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
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-6.25rem)]">
        {conversationsQuery.isLoading ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">Loading conversations...</p>
        ) : null}

        {conversationsQuery.isError ? (
          <p className="px-4 py-3 text-sm text-destructive">Unable to load conversations.</p>
        ) : null}

        {!conversationsQuery.isLoading && !conversationsQuery.isError && filteredConversations.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No conversations found.</p>
        ) : null}

        {filteredConversations.map((conversation) => {
          const otherParticipant = (conversation.participants || []).find(
            (participant) => String(participant?._id) !== String(currentUserId),
          );

          return (
            <div key={conversation._id} className="px-3">
              <Link to={`/messages/${conversation._id}`}>
                <ConversationItem
                  title={otherParticipant?.fullName || "Conversation"}
                  subtitle={conversation.lastMessage?.text || "No messages yet"}
                  avatarUrl={otherParticipant?.profileImageUrl || ""}
                  unreadCount={conversation.unreadCount || 0}
                  isActive={String(conversationId) === String(conversation._id)}
                />
              </Link>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
