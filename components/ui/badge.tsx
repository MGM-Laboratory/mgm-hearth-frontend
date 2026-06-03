import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-caption font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-blue-50 text-ink",
        green: "border-transparent bg-brand-green-50 text-ink",
        red: "border-transparent bg-brand-red-50 text-ink",
        yellow: "border-transparent bg-brand-yellow-50 text-ink",
        outline: "border-line bg-transparent text-ink-2",
        solid: "border-transparent bg-ink text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
