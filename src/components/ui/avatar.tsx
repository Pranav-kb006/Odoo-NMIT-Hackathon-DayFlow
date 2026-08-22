import { cn } from "@/lib/utils";

export type AvatarStatus = "present" | "on-leave" | "absent" | "none";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: AvatarStatus;
  className?: string;
}

const sizeMap: Record<string, { container: string; text: string; dot: string }> = {
  sm: { container: "h-8 w-8", text: "text-xs", dot: "h-2 w-2 border" },
  md: { container: "h-10 w-10", text: "text-sm", dot: "h-2.5 w-2.5 border-2" },
  lg: { container: "h-12 w-12", text: "text-base", dot: "h-3 w-3 border-2" },
  xl: { container: "h-20 w-20", text: "text-xl", dot: "h-4 w-4 border-2" },
};

const statusColors: Record<AvatarStatus, string> = {
  present: "bg-status-present",
  "on-leave": "bg-status-on-leave",
  absent: "bg-status-absent",
  none: "",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  status = "none",
  className,
}: AvatarProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            s.container,
            "rounded-full object-cover ring-2 ring-white"
          )}
        />
      ) : (
        <div
          className={cn(
            s.container,
            "flex items-center justify-center rounded-full bg-accent-100 text-accent-700 font-semibold ring-2 ring-white",
            s.text
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {status !== "none" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white",
            s.dot,
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
