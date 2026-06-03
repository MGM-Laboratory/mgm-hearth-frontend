"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "./Icon";
import { Languages } from "lucide-react";

export function LocaleSwitcher() {
  const current = useLocale() as "en" | "id";
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, start] = useTransition();

  function setLocale(next: "en" | "id") {
    if (next === current) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    start(() => router.refresh());
  }

  const other: "en" | "id" = current === "en" ? "id" : "en";
  const label = other === "en" ? t("english") : t("indonesian");

  return (
    <button
      type="button"
      onClick={() => setLocale(other)}
      disabled={pending}
      aria-label={`Switch to ${label}`}
      className="inline-flex items-center gap-1.5 rounded-DEFAULT border border-line bg-surface px-2.5 py-1.5 text-caption text-ink-2 transition-colors hover:bg-surface-muted"
    >
      <Icon icon={Languages} size={16} />
      <span className="font-mono uppercase">{other}</span>
    </button>
  );
}
