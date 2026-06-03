"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "./Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface NotificationListItem {
  id: string;
  titleI18nKey: string;
  params?: Record<string, string | number>;
  link?: string;
  readAt?: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const t = useTranslations();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.notifications.list(true),
    queryFn: async () => {
      const res = await rawFetch("/notifications?unreadOnly=true&limit=10");
      const json = (await res.json()) as { data: NotificationListItem[] };
      return json.data ?? [];
    },
    refetchInterval: 60_000,
  });

  const unreadCount = (data ?? []).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      await rawFetch("/notifications/read-all", { method: "POST" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("nav.notifications")}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-DEFAULT border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-muted"
        >
          <Icon icon={Bell} size={20} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 font-mono text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("notifications.title")}</span>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-caption text-brand-blue hover:underline"
            >
              {t("notifications.markAllRead")}
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {unreadCount === 0 ? (
          <p className="px-2 py-4 text-center text-body-sm text-ink-3">{t("notifications.empty")}</p>
        ) : (
          (data ?? []).map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={n.link ?? "/notifications"} className="flex-col items-start gap-0.5">
                <span className="text-body-sm">{t(n.titleI18nKey as never, n.params ?? {})}</span>
                <span className="text-caption text-ink-3">{new Date(n.createdAt).toLocaleString()}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-brand-blue">
            {t("common.more")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
