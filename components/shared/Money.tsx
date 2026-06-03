"use client";

import { useLocale } from "next-intl";
import { formatIDR } from "@/lib/i18n/formats";

export function Money({ amount, className }: { amount: number; className?: string }) {
  const locale = useLocale() as "en" | "id";
  return <span className={className}>{formatIDR(amount, locale)}</span>;
}
