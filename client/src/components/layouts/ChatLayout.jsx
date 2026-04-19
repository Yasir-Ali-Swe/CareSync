import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ConversationSidebar from "../messages/ConversationSidebar";
import MessageInput from "../messages/MessageInput";
import MessageWindowHeader from "../messages/MessageWindowHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/services/chat.api";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";

const upsertConversation = (list, conversation, currentUserId) => {
  if (!conversation) return list || [];

  const unreadCount = conversation.unreadCounts?.[String(currentUserId)] || 0;

  const normalized = {
    ...conversation,
    unreadCount,
  };

  const conversations = Array.isArray(list) ? [...list] : [];
  const index = conversations.findIndex((item) => String(item._id) === String(normalized._id));

  if (index === -1) {
    return [normalized, ...conversations];
  }

  conversations[index] = {
    ...conversations[index],
    ...normalized,
  };

  return conversations.sort(
    (a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0),
  );
};

const upsertMessage = (list, incomingMessage) => {
  const messages = Array.isArray(list) ? [...list] : [];

  const existingIndex = messages.findIndex(
    (message) =>
      String(message._id) === String(incomingMessage._id) ||
      (incomingMessage.clientMessageId && message.clientMessageId === incomingMessage.clientMessageId),
  );

  if (existingIndex !== -1) {
    messages[existingIndex] = {
      ...messages[existingIndex],
      ...incomingMessage,
    };
    return messages;
  }

  return [...messages, incomingMessage];
};

const ChatLayout = () => {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const currentUserId = user?.id || user?._id;
  const isVerified = Boolean(user?.isEmailVerified);
  const onboardingCompleted = Boolean(user?.isOnboardingCompleted);

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: chatApi.getConversations,
    enabled: isAuthenticated,
  });

  const conversations = conversationsQuery.data?.data?.conversations || [];

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => String(conversation._id) === String(conversationId)),
    [conversationId, conversations],
  );

  useEffect(() => {
    if (!isAuthenticated || !isVerified || !onboardingCompleted) {
      disconnectSocket();
      return;
    }

    const token = localStorage.getItem("accessToken");
    const socket = connectSocket(token);

    if (!socket) return;

    const onConnectError = (error) => {
      toast.error(error?.message || "Unable to connect chat socket.");
    };

    const onDisconnect = (reason) => {
      if (reason === "io client disconnect") return;
      toast.error("Chat disconnected. Reconnecting...");
    };

    const onIncomingMessage = ({ conversationId: incomingConversationId, message }) => {
      const normalizedConversationId = String(incomingConversationId);

      queryClient.setQueryData(["chat", "messages", normalizedConversationId], (old) => {
        const oldMessages = old?.data?.messages || [];

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            messages: upsertMessage(oldMessages, message),
          },
        };
      });

      queryClient.setQueryData(["chat", "conversations"], (old) => {
        const current = old?.data?.conversations || [];
        const existing = current.find(
          (conversation) => String(conversation._id) === normalizedConversationId,
        );

        if (!existing) {
          queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
          return old;
        }

        const updated = {
          ...existing,
          lastMessage: message,
          lastMessageAt: message?.createdAt || new Date().toISOString(),
        };

        if (String(message?.sender) !== String(currentUserId)) {
          updated.unreadCount = Number(existing.unreadCount || 0) + 1;
        }

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            conversations: upsertConversation(current, updated, currentUserId),
          },
        };
      });
    };

    const onConversationSeen = ({ conversationId: seenConversationId, userId }) => {
      queryClient.setQueryData(["chat", "messages", String(seenConversationId)], (old) => {
        const oldMessages = old?.data?.messages || [];

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            messages: oldMessages.map((message) => {
              const seenBy = Array.isArray(message.seenBy) ? [...message.seenBy] : [];
              const alreadySeen = seenBy.some((entry) => String(entry.user) === String(userId));

              if (alreadySeen) return message;

              return {
                ...message,
                seenBy: [...seenBy, { user: userId, seenAt: new Date().toISOString() }],
              };
            }),
          },
        };
      });

      if (String(userId) === String(currentUserId)) {
        queryClient.setQueryData(["chat", "conversations"], (old) => {
          const current = old?.data?.conversations || [];
          const updated = current.map((conversation) => {
            if (String(conversation._id) !== String(seenConversationId)) {
              return conversation;
            }

            return {
              ...conversation,
              unreadCount: 0,
            };
          });

          return {
            ...(old || {}),
            data: {
              ...(old?.data || {}),
              conversations: updated,
            },
          };
        });
      }
    };

    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on("message:new", onIncomingMessage);
    socket.on("conversation:seen", onConversationSeen);

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.off("message:new", onIncomingMessage);
      socket.off("conversation:seen", onConversationSeen);
    };
  }, [
    currentUserId,
    isAuthenticated,
    isVerified,
    onboardingCompleted,
    queryClient,
  ]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socket.connected) return;

    conversations.forEach((conversation) => {
      socket.emit("conversation:join", { conversationId: conversation._id });
    });
  }, [conversations]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socket.connected || !conversationId) return;

    socket.emit("conversation:join", { conversationId });
  }, [conversationId]);

  return (
    <div className="flex h-screen w-full">
      <ConversationSidebar
        className={`${conversationId ? "hidden lg:block lg:w-1/4" : "block w-full lg:w-1/4"} border-r-4 border-border h-full`}
      />
      <div
        className={`${conversationId ? "flex flex-col w-full" : "hidden lg:flex flex-col"} flex-1 h-full`}
      >
        {conversationId ? (
          <MessageWindowHeader
            conversation={selectedConversation}
            currentUserId={currentUserId}
          />
        ) : null}
        <Outlet context={{ selectedConversation, currentUserId }} />
        {conversationId ? (
          <MessageInput
            selectedConversation={selectedConversation}
            currentUserId={currentUserId}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChatLayout;
