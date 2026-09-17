"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { CorrectiveAction } from "@/types";
import { AlertTriangle, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

type ViewMode = "kanban" | "list";

export default function NcrCarView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const { t } = useI18n();

  const KANBAN_COLUMNS = [
    { key: "open", label: t.status.open, statuses: ["open", "pending", "planned"] },
    { key: "root_cause", label: t.status.root_cause, statuses: ["root_cause"] },
    { key: "action_planned", label: t.status.action_planned, statuses: ["action_planned"] },
    { key: "in_progress", label: t.status.in_progress, statuses: ["action_in_progress", "in_progress"] },
    { key: "verification", label: t.ncrCar.pendingVerification, statuses: ["follow_up", "verified"] },
    { key: "closed", label: t.status.closed, statuses: ["closed"] },
  ];

  const kpis = useMemo(() => actionRepo.getKpis(filters), [filters]);
  const actions = useMemo(() => actionRepo.findAll(filters), [filters]);

  const getActionsForColumn = (columnKey: string) => {
    const col = KANBAN_COLUMNS.find((c) => c.key === columnKey);
    if (!col) return [];
    return actions.filter((a) => col.statuses.includes(a.status));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t.ncrCar.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.ncrCar.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
            <div className="flex rounded-xl border border-slate-200 bg-white">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "rounded-l-xl px-3 py-2 text-sm font-medium",
                  viewMode === "kanban" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {t.ncrCar.board}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-r-xl px-3 py-2 text-sm font-medium",
                  viewMode === "list" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {t.ncrCar.list}
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard title={t.ncrCar.openNcrCar} value={kpis.open} status={kpis.open > 10 ? "warning" : "good"} href="/ncr-car" icon={<AlertTriangle className="h-6 w-6" />} />
          <KPICard title={t.ncrCar.critical} value={kpis.critical} status={kpis.critical > 0 ? "danger" : "good"} icon={<AlertCircle className="h-6 w-6" />} />
          <KPICard title={t.ncrCar.overdue} value={kpis.overdue} status={kpis.overdue > 0 ? "danger" : "good"} icon={<Clock className="h-6 w-6" />} />
          <KPICard title={t.ncrCar.pendingVerification} value={kpis.pendingVerification} status="warning" icon={<Eye className="h-6 w-6" />} />
          <KPICard title={t.ncrCar.closed} value={kpis.closed} status="good" icon={<CheckCircle className="h-6 w-6" />} />
        </div>

        {/* Kanban Board */}
        {viewMode === "kanban" && (
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-4 pb-4" style={{ minWidth: "1200px" }}>
              {KANBAN_COLUMNS.map((col) => {
                const colActions = getActionsForColumn(col.key);
                return (
                  <div key={col.key} className="min-w-[200px] flex-1">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-700">{col.label}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {colActions.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {colActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => router.push(`/ncr-car/${action.id}`)}
                          className="w-full rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-slate-400">{action.referenceNo}</span>
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                action.priority === "critical"
                                  ? "bg-red-500"
                                  : action.priority === "high"
                                  ? "bg-orange-400"
                                  : action.priority === "medium"
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              )}
                            />
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-700 line-clamp-2">{action.title}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                            <span>{departments.find((d) => d.id === action.departmentId)?.name}</span>
                            <span>{action.dueDate}</span>
                          </div>
                        </button>
                      ))}
                      {colActions.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                          {t.ncrCar.noItems}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <Panel title={t.ncrCar.allRecords} subtitle={t.ncrCar.completeList} className="mt-6">
            <div className="mt-4 space-y-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => router.push(`/ncr-car/${action.id}`)}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
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
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-700">{action.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {departments.find((d) => d.id === action.departmentId)?.name} · {t.ncrCar.due} {action.dueDate}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
