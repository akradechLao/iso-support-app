"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Shield, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function AlertCenterView() {
  const { filters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();

  const actions = useMemo(() => actionRepo.findAll(filters), [filters]);
  const overdueActions = useMemo(() => actionRepo.findOverdue(), []);

  const sortedActions = useMemo(() => {
    return [...actions].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [actions]);

  const pendingCount = actions.filter(
    (a) => a.status === "action_in_progress" || a.status === "follow_up"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Nav Row */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <span className="transition group-hover:-translate-x-0.5">←</span>
            กลับไป Dashboard
          </Link>
          <Link
            href="/ncr-car"
            className="group flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            ดู NCR/CAR
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-5 shadow-lg shadow-indigo-500/20">
          <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-black">
              7
            </span>
            ศูนย์แจ้งเตือน — Alert &amp; Action Center
          </h1>
        </div>

        {/* Stat Boxes */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push("/ncr-car?status=overdue")}
            className="group relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 text-left transition hover:border-red-300 hover:shadow-md hover:shadow-red-500/10 dark:border-red-800 dark:from-red-950/50 dark:to-red-900/30 dark:hover:border-red-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">
                  {overdueActions.length}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-red-600/80 dark:text-red-400/80">
                  Overdue
                </p>
              </div>
              <div className="rounded-lg bg-red-100 p-1.5 dark:bg-red-900/50">
                <Clock className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/ncr-car?priority=critical")}
            className="group relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 text-left transition hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 dark:border-orange-800 dark:from-orange-950/50 dark:to-orange-900/30 dark:hover:border-orange-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {actions.filter((a) => a.priority === "critical").length}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-orange-600/80 dark:text-orange-400/80">
                  Critical
                </p>
              </div>
              <div className="rounded-lg bg-orange-100 p-1.5 dark:bg-orange-900/50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/ncr-car?status=in_progress")}
            className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-left transition hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 dark:border-blue-800 dark:from-blue-950/50 dark:to-blue-900/30 dark:hover:border-blue-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {pendingCount}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-blue-600/80 dark:text-blue-400/80">
                  Pending
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/50">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </button>
        </div>

        {/* Action List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              All Actions — Prioritized by Risk
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedActions.map((action) => {
              const isOverdue =
                new Date(action.dueDate) < new Date() &&
                action.status !== "closed" &&
                action.status !== "verified";
              return (
                <button
                  key={action.id}
                  onClick={() => router.push(`/ncr-car/${action.id}`)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    isOverdue && "bg-red-50/50 dark:bg-red-950/20"
                  )}
                >
                  <span
                    className={cn(
                      "h-8 w-1 shrink-0 rounded-full",
                      action.priority === "critical"
                        ? "bg-rose-500"
                        : action.priority === "high"
                        ? "bg-amber-400"
                        : "bg-blue-500"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {action.referenceNo}
                      </span>
                      <StatusBadge status={action.status} />
                      {isOverdue && (
                        <span className="rounded-full bg-red-100 px-1.5 py-px text-[10px] font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {action.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {departments.find((d) => d.id === action.departmentId)?.name} · Due{" "}
                      {action.dueDate}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                      action.priority === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : action.priority === "high"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                        : action.priority === "medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    )}
                  >
                    {t.priority[action.priority]}
                  </span>
                </button>
              );
            })}
            {sortedActions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No actions found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
