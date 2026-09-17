"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function AlertCenterView() {
  const { filters, setFilters } = useFilters();
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t.alerts.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.alerts.subtitle}
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Panel title={t.alerts.overdueActions} subtitle={t.alerts.requireImmediateAttention}>
            <div className="mt-4">
              <p className="text-3xl font-black text-red-600">{overdueActions.length}</p>
              <p className="mt-1 text-sm text-slate-500">{t.alerts.actionsPastDue}</p>
            </div>
          </Panel>
          <Panel title={t.alerts.criticalPriority} subtitle={t.alerts.highestSeverity}>
            <div className="mt-4">
              <p className="text-3xl font-black text-orange-600">
                {actions.filter((a) => a.priority === "critical").length}
              </p>
              <p className="mt-1 text-sm text-slate-500">{t.alerts.criticalItems}</p>
            </div>
          </Panel>
          <Panel title={t.alerts.pendingVerification} subtitle={t.alerts.awaitingVerification}>
            <div className="mt-4">
              <p className="text-3xl font-black text-blue-600">
                {actions.filter((a) => a.status === "action_in_progress" || a.status === "follow_up").length}
              </p>
              <p className="mt-1 text-sm text-slate-500">{t.alerts.actionsInProgress}</p>
            </div>
          </Panel>
        </div>

        {/* Action List */}
        <Panel title={t.alerts.allActions} subtitle={t.alerts.prioritizedByRisk} className="mt-6">
          <div className="mt-4 space-y-2">
            {sortedActions.map((action) => {
              const isOverdue = new Date(action.dueDate) < new Date() && action.status !== "closed" && action.status !== "verified";
              return (
                <button
                  key={action.id}
                  onClick={() => router.push(`/ncr-car/${action.id}`)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/30",
                    isOverdue ? "border-red-200 bg-red-50/30" : "border-slate-100"
                  )}
                >
                  <span
                    className={cn(
                      "h-10 w-1 rounded-full",
                      action.priority === "critical"
                        ? "bg-rose-500"
                        : action.priority === "high"
                        ? "bg-amber-400"
                        : "bg-blue-500"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{action.referenceNo}</span>
                      <StatusBadge status={action.status} />
                      {isOverdue && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          {t.alerts.overdue}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-700">{action.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {departments.find((d) => d.id === action.departmentId)?.name} · {t.ncrCar.due} {action.dueDate}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-bold",
                      action.priority === "critical"
                        ? "bg-red-100 text-red-700"
                        : action.priority === "high"
                        ? "bg-orange-100 text-orange-700"
                        : action.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {t.priority[action.priority]}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
