"use client";

import { useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAssetList, type AssetListFilters, type AssetModelSummary } from "@/lib/api/hooks/assets";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";

export function AssetList({ filters }: { filters: AssetListFilters }) {
  const t = useTranslations();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useAssetList(filters);
  const parentRef = useRef<HTMLDivElement>(null);

  const allRows: AssetModelSummary[] = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data),
    [data],
  );

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    estimateSize: () => 76,
    getScrollElement: () => parentRef.current,
    overscan: 8,
  });

  useEffect(() => {
    const items = virtualizer.getVirtualItems();
    const last = items[items.length - 1];
    if (!last) return;
    if (last.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [virtualizer, allRows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (isLoading) return <p className="text-body-sm text-ink-3">{t("common.loading")}</p>;
  if (allRows.length === 0) return <EmptyState title={t("common.empty")} />;

  return (
    <div ref={parentRef} className="h-[calc(100vh-280px)] overflow-auto rounded-DEFAULT border border-line bg-surface">
      <div style={{ height: virtualizer.getTotalSize() }} className="relative">
        {virtualizer.getVirtualItems().map((vi) => {
          const isLoader = vi.index >= allRows.length;
          const row = allRows[vi.index];
          return (
            <div
              key={vi.key}
              data-index={vi.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full border-b border-line px-4 py-3"
              style={{ transform: `translateY(${vi.start}px)` }}
            >
              {isLoader ? (
                <p className="py-2 text-center text-caption text-ink-3">{t("common.loading")}</p>
              ) : (
                <Link href={`/assets/${row.id}`} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
                    {row.coverPhotoUrl ? (
                      <img src={row.coverPhotoUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-ink">{row.name}</p>
                    <p className="truncate text-caption text-ink-3">
                      {row.categoryName ?? "—"}
                      {row.tags?.length ? ` · ${row.tags.slice(0, 3).join(" · ")}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {row.availableCount ?? 0}/{row.unitCount ?? 0}
                    </Badge>
                    {row.status ? <StatusBadge domain="asset" status={row.status} /> : null}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
