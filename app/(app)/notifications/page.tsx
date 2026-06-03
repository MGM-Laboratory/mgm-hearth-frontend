"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/lib/api/hooks/notifications";
import { DateTime } from "@/components/shared/DateTime";

export default function NotificationsPage() {
  const t = useTranslations();
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } = useNotifications(false);
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const items = (data?.pages ?? []).flatMap((p) => p.data);

  return (
    <div className="ds-container">
      <PageHeader
        title={t("notifications.title")}
        actions={
          items.some((n) => !n.readAt) ? (
            <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}>
              {t("notifications.markAllRead")}
            </Button>
          ) : null
        }
      />
      {isLoading ? (
        <p className="text-body-sm text-ink-3">{t("common.loading")}</p>
      ) : items.length === 0 ? (
        <EmptyState title={t("notifications.empty")} />
      ) : (
        <ul className="divide-y divide-line rounded-DEFAULT border border-line bg-surface">
          {items.map((n) => (
            <li key={n.id} className={`flex items-start justify-between gap-4 p-4 ${n.readAt ? "" : "bg-brand-blue-50/40"}`}>
              <div className="min-w-0">
                <Link href={n.link ?? "#"} className="block text-body-sm text-ink hover:underline">
                  {t(n.titleI18nKey as never, n.params ?? {})}
                </Link>
                <DateTime value={n.createdAt} variant="long" className="mt-1 block font-mono text-caption text-ink-3" />
              </div>
              {!n.readAt ? (
                <Button variant="ghost" size="sm" onClick={() => markOne.mutate(n.id)}>
                  {t("common.confirm")}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {t("common.more")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
