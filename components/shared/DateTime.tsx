"use client";

import { useLocale } from "next-intl";
import { formatDateLong, formatDateShort, formatTime } from "@/lib/i18n/formats";

type Variant = "short" | "long" | "time";

export function DateTime({
  value,
  variant = "short",
  className,
}: {
  value: string | Date;
  variant?: Variant;
  className?: string;
}) {
  const locale = useLocale() as "en" | "id";
  const formatted =
    variant === "long" ? formatDateLong(value, locale) : variant === "time" ? formatTime(value, locale) : formatDateShort(value, locale);
  return (
    <time dateTime={typeof value === "string" ? value : value.toISOString()} className={className}>
      {formatted}
    </time>
  );
}
