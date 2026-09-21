"use client";

import { cn } from "@/lib/utils";
import { Status } from "@/types";
import { STATUS_COLORS } from "@/lib/constants";
import { useI18n } from "@/i18n/I18nContext";

const STATUS_DARK: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "dark:bg-slate-700", text: "dark:text-slate-300", dot: "dark:bg-slate-500" },
  pending: { bg: "dark:bg-amber-900/40", text: "dark:text-amber-300", dot: "dark:bg-amber-400" },
  in_progress: { bg: "dark:bg-blue-900/40", text: "dark:text-blue-300", dot: "dark:bg-blue-400" },
  due_soon: { bg: "dark:bg-orange-900/40", text: "dark:text-orange-300", dot: "dark:bg-orange-400" },
  overdue: { bg: "dark:bg-red-900/40", text: "dark:text-red-300", dot: "dark:bg-red-400" },
  verified: { bg: "dark:bg-emerald-900/40", text: "dark:text-emerald-300", dot: "dark:bg-emerald-400" },
  closed: { bg: "dark:bg-emerald-900/40", text: "dark:text-emerald-300", dot: "dark:bg-emerald-400" },
  compliant: { bg: "dark:bg-emerald-900/40", text: "dark:text-emerald-300", dot: "dark:bg-emerald-400" },
  non_compliant: { bg: "dark:bg-red-900/40", text: "dark:text-red-300", dot: "dark:bg-red-400" },
  published: { bg: "dark:bg-emerald-900/40", text: "dark:text-emerald-300", dot: "dark:bg-emerald-400" },
  revision_due: { bg: "dark:bg-amber-900/40", text: "dark:text-amber-300", dot: "dark:bg-amber-400" },
  obsolete: { bg: "dark:bg-slate-700", text: "dark:text-slate-500", dot: "dark:bg-slate-600" },
  planned: { bg: "dark:bg-blue-900/40", text: "dark:text-blue-300", dot: "dark:bg-blue-400" },
  finding_recorded: { bg: "dark:bg-orange-900/40", text: "dark:text-orange-300", dot: "dark:bg-orange-400" },
  reported: { bg: "dark:bg-amber-900/40", text: "dark:text-amber-300", dot: "dark:bg-amber-400" },
  follow_up: { bg: "dark:bg-violet-900/40", text: "dark:text-violet-300", dot: "dark:bg-violet-400" },
  root_cause: { bg: "dark:bg-orange-900/40", text: "dark:text-orange-300", dot: "dark:bg-orange-400" },
  action_planned: { bg: "dark:bg-blue-900/40", text: "dark:text-blue-300", dot: "dark:bg-blue-400" },
  action_in_progress: { bg: "dark:bg-blue-900/40", text: "dark:text-blue-300", dot: "dark:bg-blue-400" },
  applicable: { bg: "dark:bg-blue-900/40", text: "dark:text-blue-300", dot: "dark:bg-blue-400" },
  pending_assessment: { bg: "dark:bg-amber-900/40", text: "dark:text-amber-300", dot: "dark:bg-amber-400" },
  action_required: { bg: "dark:bg-red-900/40", text: "dark:text-red-300", dot: "dark:bg-red-400" },
  open: { bg: "dark:bg-blue-900/40", text: "dark:text-blue-300", dot: "dark:bg-blue-400" },
};

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { t } = useI18n();
  const lightColors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const darkColors = STATUS_DARK[status] || STATUS_DARK.draft;
  const label = (t.status as Record<string, string>)[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        lightColors.bg,
        lightColors.text,
        darkColors.bg,
        darkColors.text,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", lightColors.dot, darkColors.dot)} />
      {label}
    </span>
  );
}
