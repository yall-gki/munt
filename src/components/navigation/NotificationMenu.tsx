"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Bell, Check, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

const formatTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function NotificationMenu() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications?limit=20");
      setNotifications(res.data?.notifications ?? []);
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string, read: boolean) => {
    try {
      await axios.patch("/api/notifications", { id, read });
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev + (read ? -1 : 1)));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch("/api/notifications", { markAllRead: true });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:text-white transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-[10px] font-semibold text-black flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[320px] border-zinc-800 bg-zinc-950 text-white p-2"
      >
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-300 hover:text-blue-200"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <div className="max-h-[320px] overflow-y-auto">
          {loading ? (
            <div className="px-2 py-6 text-sm text-zinc-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="px-2 py-6 text-sm text-zinc-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={(event) => {
                  event.preventDefault();
                  if (!item.read) markRead(item.id, true);
                  if (item.link) router.push(item.link);
                }}
                className={cn(
                  "flex flex-col items-start gap-1 px-2 py-2",
                  item.read ? "text-zinc-400" : "text-zinc-200"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {item.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-snug">{item.message}</p>
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-[0.2em]",
                      item.read ? "text-zinc-500" : "text-blue-300"
                    )}
                  >
                    {item.read ? "Read" : "Unread"}
                  </span>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      markRead(item.id, !item.read);
                    }}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    {item.read ? (
                      <>
                        <EyeOff className="h-3 w-3" /> Mark unread
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" /> Mark read
                      </>
                    )}
                  </button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
