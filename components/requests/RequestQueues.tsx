"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { DateTime } from "@/components/shared/DateTime";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  PENDING_STATUSES,
  IN_PROGRESS_STATUSES,
  CLOSED_STATUSES,
  useRequestList,
  type RequestKind,
} from "@/lib/api/hooks/requests";

type Domain = "borrow" | "procurement" | "infra" | "room" | "license" | "general";

interface Props {
  kind: RequestKind;
  basePath: string;
}

export function RequestQueues({ kind, basePath }: Props) {
  const [tab, setTab] = useState<"pending" | "in_progress" | "closed">("pending");
  const t = useTranslations();
  const statuses =
    tab === "pending" ? PENDING_STATUSES[kind] : tab === "in_progress" ? IN_PROGRESS_STATUSES[kind] : CLOSED_STATUSES[kind];

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="in_progress">In progress</TabsTrigger>
        <TabsTrigger value="closed">Closed</TabsTrigger>
      </TabsList>
      <TabsContent value={tab}>
        <Queue kind={kind} statuses={statuses} basePath={basePath} />
      </TabsContent>
    </Tabs>
  );
}

function Queue({ kind, statuses, basePath }: { kind: RequestKind; statuses: string[]; basePath: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, error, refetch } = useRequestList(kind, statuses);
  const t = useTranslations();
  const items = (data?.pages ?? []).flatMap((p) => p.data);
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (isLoading) return <p className="text-body-sm text-ink-3">{t("common.loading")}</p>;
  if (items.length === 0) return <EmptyState title={t("common.empty")} />;
  const domain = kind === "room" ? "room" : (kind as Domain);
  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell><TicketNumber value={r.ticketNumber} /></TableCell>
              <TableCell>{r.requester?.name ?? r.requester?.email ?? "—"}</TableCell>
              <TableCell><StatusBadge domain={domain} status={r.status} /></TableCell>
              <TableCell><DateTime value={r.createdAt} /></TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${basePath}/${r.id}`}>{t("common.open")} →</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>{t("common.more")}</Button>
        </div>
      ) : null}
    </div>
  );
}
