"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/Icon";
import { X } from "lucide-react";

export interface CompanionRef {
  id: string;
  name: string;
  coverPhotoUrl?: string;
}

interface Props {
  value: CompanionRef[];
  onChange: (next: CompanionRef[]) => void;
  excludeModelId?: string;
}

export function CompanionPicker({ value, onChange, excludeModelId }: Props) {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["assets", "companion-search", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const res = await rawFetch(`/assets?q=${encodeURIComponent(q)}&limit=10`);
      const json = (await res.json()) as { data?: CompanionRef[] };
      return (json.data ?? []).filter((x) => x.id !== excludeModelId);
    },
  });

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search models to add as companions…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {(data ?? []).length > 0 ? (
        <ul className="max-h-40 overflow-auto rounded-DEFAULT border border-line bg-surface">
          {(data ?? []).map((m) => (
            <li key={m.id} className="flex items-center justify-between border-b border-line px-3 py-2 last:border-0">
              <span className="text-body-sm text-ink">{m.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (value.find((v) => v.id === m.id)) return;
                  onChange([...value, m]);
                }}
              >
                Add
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <Badge key={v.id} variant="default" className="inline-flex items-center gap-1.5">
              <span>{v.name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x.id !== v.id))}
                aria-label={`Remove ${v.name}`}
                className="text-ink-3 hover:text-ink"
              >
                <Icon icon={X} size={12} />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
