"use client";

import { useI18n } from "@/i18n/I18nContext";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-700">
        <Icon className="h-7 w-7 text-slate-400 dark:text-slate-400" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title || t.common.noData}
      </h3>
      {description && (
        <p className="mb-4 max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
