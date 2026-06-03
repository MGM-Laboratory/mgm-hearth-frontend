import Image from "next/image";
import { cn } from "@/lib/utils/cn";

// Catalog of motif × color combinations available in /patterns/.
const MOTIFS = ["arcs", "circle", "clover", "domes", "fans", "leaves", "plus", "quads", "square", "x"] as const;
const COLORS_ON_WHITE = ["blue", "green", "red", "yellow"] as const;

export type PatternColor = (typeof COLORS_ON_WHITE)[number];
export type PatternMotif = (typeof MOTIFS)[number];

interface PatternAccentProps {
  /** Choose explicit motif, or `undefined` for a stable random pick keyed on `seed`. */
  motif?: PatternMotif;
  color?: PatternColor;
  /** Used to pick a stable motif/color when not specified. */
  seed?: string;
  /** Size in CSS pixels. */
  size?: number;
  /** Visual treatment. */
  variant?: "tile" | "stack-3" | "stack-2";
  className?: string;
}

function djb2(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

/**
 * Pattern motif rendered from /patterns/ SVGs. Use sparingly per DESIGN_SYSTEM.md:
 * sidebar corner, dividers, empty states, 404, auth/gate screens, favicon — and that's it.
 */
export function PatternAccent({
  motif,
  color,
  seed = "default",
  size = 96,
  variant = "tile",
  className,
}: PatternAccentProps) {
  // Need to remap a path-style import to actual public/ URLs. We don't bundle these into
  // /public/ — they live in the workspace root at ../patterns/. Pre-build copies them in.
  // For now we rely on `/patterns/{name}.svg` route served from /public/patterns at build time.
  const h = djb2(seed);
  const m = motif ?? MOTIFS[h % MOTIFS.length];
  const c = color ?? COLORS_ON_WHITE[(h >> 4) % COLORS_ON_WHITE.length];
  const baseName = `${m}-${c}-on-white.svg`;

  const renderOne = (suffix?: string) => (
    <Image
      key={suffix ?? "0"}
      src={`/patterns/${baseName}`}
      alt=""
      width={size}
      height={size}
      className="select-none"
      aria-hidden="true"
    />
  );

  if (variant === "stack-3") {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
        {renderOne("a")}
        {renderOne("b")}
        {renderOne("c")}
      </div>
    );
  }
  if (variant === "stack-2") {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
        {renderOne("a")}
        {renderOne("b")}
      </div>
    );
  }
  return <div className={cn("inline-block", className)} aria-hidden="true">{renderOne()}</div>;
}
