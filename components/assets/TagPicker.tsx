"use client";

import { useState, useMemo } from "react";
import { useTags, useCreateTag } from "@/lib/api/hooks/assets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/Icon";
import { X, Plus } from "lucide-react";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function TagPicker({ value, onChange }: Props) {
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const [q, setQ] = useState("");

  const candidates = useMemo(() => {
    const all = tags ?? [];
    const lower = q.trim().toLowerCase();
    if (!lower) return all.slice(0, 8);
    return all.filter((t) => t.name.toLowerCase().includes(lower)).slice(0, 8);
  }, [tags, q]);

  const canCreate = q.trim().length > 1 && !(tags ?? []).some((t) => t.name.toLowerCase() === q.trim().toLowerCase());

  function addTag(name: string) {
    if (!value.includes(name)) onChange([...value, name]);
    setQ("");
  }

  return (
    <div className="space-y-2">
      <Input
        type="search"
        placeholder="Add tag…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) {
            e.preventDefault();
            if (canCreate) createTag.mutate({ name: q.trim() }, { onSuccess: (t) => addTag(t.name) });
            else addTag(q.trim());
          }
        }}
      />
      {q.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 rounded-DEFAULT border border-line bg-surface p-2">
          {candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => addTag(c.name)}
              className="rounded-sm bg-surface-muted px-2 py-1 text-caption text-ink hover:bg-brand-blue-50"
            >
              {c.name}
            </button>
          ))}
          {canCreate ? (
            <button
              type="button"
              onClick={() => createTag.mutate({ name: q.trim() }, { onSuccess: (t) => addTag(t.name) })}
              className="inline-flex items-center gap-1 rounded-sm bg-brand-blue-50 px-2 py-1 text-caption text-ink hover:bg-brand-blue-50/70"
            >
              <Icon icon={Plus} size={12} />
              Create "{q.trim()}"
            </button>
          ) : null}
        </div>
      ) : null}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="default" className="inline-flex items-center gap-1">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                aria-label={`Remove ${tag}`}
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
