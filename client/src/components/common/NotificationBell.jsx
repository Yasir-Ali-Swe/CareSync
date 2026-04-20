import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { notificationApi } from "@/services/notification.api";
import { useSelector } from "react-redux";
import { getSocket } from "@/lib/socket";

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getNotifications,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socket.connected || !isAuthenticated) return;

    const onNewNotification = (notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(notification.title);
    };

    socket.on("notification:new", onNewNotification);

    return () => {
      socket.off("notification:new", onNewNotification);
    };
  }, [isAuthenticated, queryClient]);

  const notifications = notificationsQuery.data?.data?.notifications || [];
  const unreadCount = notificationsQuery.data?.data?.unreadCount || 0;

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <Badge className="absolute top-0 right-0 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[96vw] sm:w-80 max-h-100 overflow-hidden flex flex-col p-0">
        <div className="sticky top-0 bg-card border-b p-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Notifications</h2>
          {unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline"
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          ) : null}
        </div>

        <div className="overflow-y-auto flex-1">
          {notificationsQuery.isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border-b p-3 hover:bg-muted transition-colors cursor-pointer ${
                  !notification.readAt ? "bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (!notification.readAt) {
                    handleMarkAsRead(notification._id);
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.readAt ? (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
