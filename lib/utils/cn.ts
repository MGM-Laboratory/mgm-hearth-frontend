import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doesn't know about our custom design-system font sizes
 * (`text-caption`, `text-body-sm`, …). By default it lumps `text-<token>` into
 * the text-color group, so a size class like `text-caption` (added by Button
 * `size="sm"`) would wrongly evict a real color like `text-white` — producing
 * dark text on a colored button. Register the tokens as font sizes so size and
 * color classes never conflict.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "mono",
            "eyebrow",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
