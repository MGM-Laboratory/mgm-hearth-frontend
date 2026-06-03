"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Icon } from "./Icon";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface AssetHit {
  id: string;
  name: string;
  categoryName?: string;
}

export function GlobalSearch() {
  const t = useTranslations("common");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data } = useQuery({
    queryKey: queryKeys.assets.list({ q, limit: 8 }),
    enabled: q.length >= 2,
    queryFn: async () => {
      const res = await rawFetch(`/assets?q=${encodeURIComponent(q)}&limit=8`);
      const json = (await res.json()) as { data?: AssetHit[] };
      return json.data ?? [];
    },
    staleTime: 10_000,
  });

  return (
    <Popover open={open && q.length >= 2} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Icon icon={Search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <Input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            placeholder={t("search")}
            aria-label="Search assets"
            className="pl-9"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 font-mono text-caption text-ink-3 md:inline">
            ⌘K
          </kbd>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[400px] p-2">
        {(data ?? []).length === 0 ? (
          <p className="px-2 py-2 text-body-sm text-ink-3">{t("empty")}</p>
        ) : (
          <ul role="listbox">
            {(data ?? []).map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-body-sm text-ink hover:bg-surface-muted"
                  onClick={() => {
                    router.push(`/assets/${hit.id}`);
                    setQ("");
                    setOpen(false);
                  }}
                >
                  <span>{hit.name}</span>
                  {hit.categoryName ? <span className="text-caption text-ink-3">{hit.categoryName}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
