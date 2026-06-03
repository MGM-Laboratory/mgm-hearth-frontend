import type { ReactNode } from "react";
import { PatternAccent } from "./PatternAccent";

export function EmptyState({
  title,
  description,
  action,
  seed,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  seed?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong bg-surface px-8 py-16 text-center">
      <PatternAccent seed={seed ?? title} size={80} />
      <div className="space-y-1">
        <p className="font-display text-h3 text-ink">{title}</p>
        {description ? <p className="text-body-sm text-ink-3">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
