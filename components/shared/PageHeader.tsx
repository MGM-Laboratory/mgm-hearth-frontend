import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AccentColor = "blue" | "yellow" | "red" | "green";

interface PageHeaderProps {
  /** The page's heading. Renders as `<h1>` and is the SOLE display heading on the page (per DESIGN_SYSTEM §3.3). */
  title: string;
  /** One word inside `title` to colorize. Used for major moments only. */
  accentWord?: string;
  accentColor?: AccentColor;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

const ACCENT_CLASS: Record<AccentColor, string> = {
  blue: "text-brand-blue",
  yellow: "text-brand-yellow",
  red: "text-brand-red",
  green: "text-brand-green",
};

export function PageHeader({
  title,
  accentWord,
  accentColor = "blue",
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  const renderedTitle = (() => {
    if (!accentWord) return title;
    const idx = title.toLowerCase().indexOf(accentWord.toLowerCase());
    if (idx === -1) return title;
    return (
      <>
        {title.slice(0, idx)}
        <span className={ACCENT_CLASS[accentColor]}>{title.slice(idx, idx + accentWord.length)}</span>
        {title.slice(idx + accentWord.length)}
      </>
    );
  })();

  return (
    <header className={cn("flex flex-col gap-3 pb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {eyebrow ? (
          <p className="mb-2 font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-display-lg text-ink">{renderedTitle}</h1>
        {description ? <p className="mt-2 max-w-prose text-body text-ink-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
