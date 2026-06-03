import { forwardRef, type SVGAttributes } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type IconProps = SVGAttributes<SVGSVGElement> & {
  icon: LucideIcon;
  size?: 16 | 20 | 24;
};

/**
 * Lucide wrapper enforcing the design system's stroke width (2.25) and round caps/joins.
 * Use this everywhere instead of raw <SomeIcon /> from lucide-react.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon: I, size = 20, className, ...rest },
  ref,
) {
  return (
    <I
      ref={ref}
      size={size}
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...rest}
    />
  );
});
