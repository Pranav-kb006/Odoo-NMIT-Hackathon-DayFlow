import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ─── Label ─── */
const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

/* ─── Input ─── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 ease-out focus:outline-none focus:ring-2",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
          : "border-slate-300 focus:border-accent focus:ring-accent/40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Label, Input };
