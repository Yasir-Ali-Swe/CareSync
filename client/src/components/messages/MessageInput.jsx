import React from "react";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/services/chat.api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

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

  return conversations;
};

const MessageInput = ({ selectedConversation, currentUserId }) => {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachment(file);
  };

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onMutate: async (payload) => {
      const targetConversationId = payload.conversationId;

      if (!targetConversationId) {
        return {
          targetConversationId: null,
          previousMessages: null,
          previousConversations: queryClient.getQueryData(["chat", "conversations"]),
        };
      }

      await queryClient.cancelQueries({ queryKey: ["chat", "messages", targetConversationId] });

      const previousMessages = queryClient.getQueryData([
        "chat",
        "messages",
        targetConversationId,
      ]);
      const previousConversations = queryClient.getQueryData(["chat", "conversations"]);

      const clientMessageId = `client-${Date.now()}`;
      const optimisticMessage = {
        _id: clientMessageId,
        clientMessageId,
        conversation: targetConversationId,
        sender: currentUserId,
        text: payload.text,
        attachment: attachment
          ? {
              fileName: attachment.name,
              mimeType: attachment.type,
              size: attachment.size,
            }
          : null,
        seenBy: [{ user: currentUserId, seenAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["chat", "messages", targetConversationId], (old) => {
        const oldMessages = old?.data?.messages || [];
        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            messages: [...oldMessages, optimisticMessage],
          },
        };
      });

      queryClient.setQueryData(["chat", "conversations"], (old) => {
        const conversations = old?.data?.conversations || [];
        const updated = conversations.map((conversation) => {
          if (String(conversation._id) !== String(targetConversationId)) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessage: optimisticMessage,
            lastMessageAt: optimisticMessage.createdAt,
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

      return {
        targetConversationId,
        clientMessageId,
        previousMessages,
        previousConversations,
      };
    },
    onError: (error, _payload, context) => {
      if (context?.targetConversationId) {
        queryClient.setQueryData(
          ["chat", "messages", context.targetConversationId],
          context.previousMessages,
        );
      }

      queryClient.setQueryData(["chat", "conversations"], context?.previousConversations);

      const errorMessage = error?.response?.data?.message || "Failed to send message.";
      toast.error(errorMessage);
    },
    onSuccess: (response, payload, context) => {
      const serverConversation = response?.data?.conversation;
      const serverMessage = response?.data?.message;
      const effectiveConversationId = serverConversation?._id || payload.conversationId;

      if (!effectiveConversationId) return;

      queryClient.setQueryData(["chat", "messages", effectiveConversationId], (old) => {
        const oldMessages = old?.data?.messages || [];
        const withoutTemp = oldMessages.filter(
          (item) => item.clientMessageId !== context?.clientMessageId,
        );

        const exists = withoutTemp.some((item) => String(item._id) === String(serverMessage?._id));

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            messages: exists ? withoutTemp : [...withoutTemp, serverMessage],
          },
        };
      });

      queryClient.setQueryData(["chat", "conversations"], (old) => {
        const conversations = old?.data?.conversations || [];
        const updatedConversation = {
          ...serverConversation,
          lastMessage: serverMessage,
          lastMessageAt: serverMessage?.createdAt,
        };

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            conversations: upsertConversation(conversations, updatedConversation, currentUserId),
          },
        };
      });

      if (!selectedConversation && serverConversation?._id) {
        navigate(`/messages/${serverConversation._id}`);
      }
    },
    onSettled: (_response, _error, payload) => {
      const targetConversationId = payload?.conversationId;
      if (targetConversationId) {
        queryClient.invalidateQueries({ queryKey: ["chat", "messages", targetConversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();

    if ((!trimmed && !attachment) || sendMessageMutation.isPending) {
      return;
    }

    sendMessageMutation.mutate({
      conversationId: selectedConversation?._id,
      recipientId: selectedConversation ? undefined : conversationId,
      text: trimmed,
      attachment,
    });

    setMessage("");
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend();
  };

  return (
    <form
      className="flex items-center justify-between gap-2 w-full h-15 p-2 border-t-2"
      onSubmit={handleSubmit}
    >
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
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button
        type="submit"
        size="icon"
        variant="outline"
        className={"p-0"}
        disabled={sendMessageMutation.isPending}
      >
        <Send className="size-5 text-primary cursor-pointer" />
      </Button>
    </form>
  );
};

export default MessageInput;
