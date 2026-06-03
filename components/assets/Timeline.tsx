"use client";

import { useTimeline } from "@/lib/api/hooks/assets";
import { DateTime } from "@/components/shared/DateTime";
import { Icon } from "@/components/shared/Icon";
import { Circle } from "lucide-react";

export function Timeline({ modelId }: { modelId: string }) {
  const { data, isLoading } = useTimeline(modelId);
  if (isLoading) return <p className="text-body-sm text-ink-3">Loading…</p>;
  if (!data || data.length === 0) return <p className="text-body-sm text-ink-3">No activity yet.</p>;
  return (
    <ol className="relative ml-3 space-y-4 border-l border-line pl-5">
      {data.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[27px] top-1.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue">
            <Icon icon={Circle} size={8} className="fill-current" />
          </span>
          <p className="text-body-sm text-ink">{e.message}</p>
          <p className="mt-0.5 font-mono text-caption text-ink-3">
            <DateTime value={e.at} variant="long" />
            {e.actor ? ` · ${e.actor.name}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
