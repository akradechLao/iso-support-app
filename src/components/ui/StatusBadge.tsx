"use client";

import { cn } from "@/lib/utils";
import { Status } from "@/types";
import { STATUS_COLORS } from "@/lib/constants";
import { useI18n } from "@/i18n/I18nContext";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { t } = useI18n();
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = (t.status as Record<string, string>)[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        colors.bg,
        colors.text,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {label}
    </span>
  );
}
