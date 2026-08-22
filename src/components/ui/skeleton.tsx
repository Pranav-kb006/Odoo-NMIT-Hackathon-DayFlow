import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton h-4 w-full", className)}
      aria-hidden="true"
    />
  );
}

/* ─── Pre-composed skeletons ─── */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className
      )}
    >
      <Skeleton className="mb-3 h-3 w-2/5" />
      <Skeleton className="mb-2 h-8 w-3/5" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 py-3 px-4", className)}>
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <SkeletonRow key={i} className="border-b border-slate-50 last:border-0" />
      ))}
    </div>
  );
}
