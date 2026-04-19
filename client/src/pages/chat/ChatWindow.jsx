import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/services/chat.api";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useOutletContext } from "react-router-dom";

const ChatWindow = () => {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const { currentUserId, selectedConversation } = useOutletContext() || {};
  const activeConversationId = selectedConversation?._id;

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", activeConversationId],
    queryFn: () => chatApi.getMessages(activeConversationId),
    enabled: Boolean(activeConversationId),
  });

  const markSeenMutation = useMutation({
    mutationFn: () => chatApi.markSeen(activeConversationId),
    onSuccess: () => {
      queryClient.setQueryData(["chat", "conversations"], (old) => {
        const conversations = old?.data?.conversations || [];

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            conversations: conversations.map((conversation) => {
              if (String(conversation._id) !== String(activeConversationId)) {
                return conversation;
              }

              return {
                ...conversation,
                unreadCount: 0,
              };
            }),
          },
        };
      });
    },
  });

  useEffect(() => {
    if (!activeConversationId || !messagesQuery.data?.data?.messages?.length || markSeenMutation.isPending) {
      return;
    }

    markSeenMutation.mutate();

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("message:seen", { conversationId: activeConversationId });
    }
  }, [activeConversationId, messagesQuery.data?.data?.messages?.length]);
  if (!selectedConversation && conversationId) {
    return (
      <div className="w-full h-[calc(100vh-12.50rem)] flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Send a message to start this conversation.</p>
      </div>
    );
  }


  const messages = messagesQuery.data?.data?.messages || [];

  if (messagesQuery.isLoading) {
    return (
      <div className="w-full h-[calc(100vh-12.50rem)] flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messagesQuery.isError) {
    return (
      <div className="w-full h-[calc(100vh-12.50rem)] flex-1 flex items-center justify-center">
        <p className="text-sm text-destructive">Unable to load messages.</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-[calc(100vh-12.50rem)] flex-1`}>
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <div
              key={msg._id || msg.clientMessageId}
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg wrap-break-word ${
                String(msg.sender) === String(currentUserId)
                  ? "self-end bg-primary text-secondary font-normal"
                  : "self-start bg-secondary text-primary font-normal"
              }`}
            >
              {msg.text || "Attachment"}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatWindow;
