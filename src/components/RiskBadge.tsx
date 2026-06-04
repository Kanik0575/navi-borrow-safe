import { cn } from "@/lib/utils";
import type { RiskBand } from "@/lib/db/schema";

interface RiskBadgeProps {
  band: RiskBand;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const CONFIG: Record<RiskBand, { label: string; color: string; dot: string; bg: string }> = {
  low: {
    label: "Low Risk",
    color: "text-emerald-700",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
  },
  medium: {
    label: "Medium Risk",
    color: "text-amber-700",
    dot: "bg-amber-500",
    bg: "bg-amber-50 border-amber-200",
  },
  high: {
    label: "High Risk",
    color: "text-red-700",
    dot: "bg-red-500",
    bg: "bg-red-50 border-red-200",
  },
};

export function RiskBadge({ band, size = "md", showLabel = true }: RiskBadgeProps) {
  const cfg = CONFIG[band];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        cfg.bg,
        cfg.color,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base"
      )}
    >
      <span className={cn("rounded-full", cfg.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {showLabel && cfg.label}
    </span>
  );
}
