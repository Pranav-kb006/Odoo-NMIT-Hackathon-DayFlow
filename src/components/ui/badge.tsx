import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-200/50",
  warning: "bg-amber-50 text-amber-700 border-amber-200/50",
  danger: "bg-red-50 text-red-700 border-red-200/50",
  neutral: "bg-slate-100 text-slate-600 border-slate-200/50",
  info: "bg-blue-50 text-blue-700 border-blue-200/50",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
