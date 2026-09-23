"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { users } from "@/data/mock/users";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import StatusBadge from "@/components/ui/StatusBadge";
import DonutChart from "@/components/charts/DonutChart";
import Modal from "@/components/ui/Modal";
import { CorrectiveAction, Priority, Status } from "@/types";
import { AlertTriangle, Clock, CheckCircle, AlertCircle, Eye, Download, Plus, ArrowLeft, LayoutGrid, List, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/i18n/I18nContext";
import { downloadCsv } from "@/lib/export";

type ViewMode = "kanban" | "list";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  overdue: "bg-red-500",
  closed: "bg-emerald-500",
  pending: "bg-violet-500",
};

export default function NcrCarView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    departmentId: "QA",
    ownerId: "U001",
    dueDate: "",
    status: "open" as Status,
    priority: "medium" as Priority,
    source: "IQA",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const KANBAN_COLUMNS = [
    { key: "open", label: t.status.open, statuses: ["open", "pending", "planned"] },
    { key: "root_cause", label: t.status.root_cause, statuses: ["root_cause"] },
    { key: "action_planned", label: t.status.action_planned, statuses: ["action_planned"] },
    { key: "in_progress", label: t.status.in_progress, statuses: ["action_in_progress", "in_progress"] },
    { key: "verification", label: t.ncrCar.pendingVerification, statuses: ["follow_up", "verified"] },
    { key: "closed", label: t.status.closed, statuses: ["closed"] },
  ];

  const kpis = useMemo(() => actionRepo.getKpis(filters), [filters, version]);
  const actions = useMemo(() => actionRepo.findAll(filters), [filters, version]);

  const statBoxes = useMemo(() => {
    const overdueCount = actions.filter((a) => {
      if (a.status === "closed") return false;
      const due = new Date(a.dueDate);
      return due < new Date();
    }).length;
    return [
      { label: "Open", value: kpis.open, color: "bg-blue-500", textColor: "text-blue-600", borderColor: "border-blue-200 dark:border-blue-800" },
      { label: "In Progress", value: kpis.pendingVerification, color: "bg-amber-500", textColor: "text-amber-600", borderColor: "border-amber-200 dark:border-amber-800" },
      { label: "Overdue", value: overdueCount || kpis.overdue, color: "bg-red-500", textColor: "text-red-600", borderColor: "border-red-200 dark:border-red-800" },
      { label: "Closed", value: kpis.closed, color: "bg-emerald-500", textColor: "text-emerald-600", borderColor: "border-emerald-200 dark:border-emerald-800" },
      { label: "Total", value: actions.length, color: "bg-slate-500", textColor: "text-slate-600", borderColor: "border-slate-200 dark:border-slate-700" },
    ];
  }, [kpis, actions]);

  const donutData = useMemo(() => {
    const overdueCount = actions.filter((a) => {
      if (a.status === "closed") return false;
      return new Date(a.dueDate) < new Date();
    }).length;
    return [
      { name: "Open", value: kpis.open, color: "#3b82f6" },
      { name: "In Progress", value: kpis.pendingVerification, color: "#f59e0b" },
      { name: "Overdue", value: overdueCount || kpis.overdue, color: "#ef4444" },
      { name: "Closed", value: kpis.closed, color: "#10b981" },
    ].filter((d) => d.value > 0);
  }, [kpis, actions]);

  const getActionsForColumn = (columnKey: string) => {
    const col = KANBAN_COLUMNS.find((c) => c.key === columnKey);
    if (!col) return [];
    return actions.filter((a) => col.statuses.includes(a.status));
  };

  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    e.dataTransfer.setData("text/plain", actionId);
    setDraggedId(actionId);
  };

  const handleDragEnd = () => setDraggedId(null);

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData("text/plain");
    setDraggedId(null);
    if (!actionId) return;
    const col = KANBAN_COLUMNS.find((c) => c.key === colKey);
    if (!col || col.statuses.length === 0) return;
    const target = col.statuses[0];
    actionRepo.update(actionId, { status: target as Status });
    setVersion((v) => v + 1);
  };

  const openAdd = () => {
    setForm({
      title: "",
      description: "",
      departmentId: "QA",
      ownerId: "U001",
      dueDate: "",
      status: "open",
      priority: "medium",
      source: "IQA",
    });
    setShowAdd(true);
  };

  const handleCreate = () => {
    if (!form.title.trim()) return;
    actionRepo.create({
      title: form.title.trim(),
      description: form.description.trim(),
      departmentId: form.departmentId,
      ownerId: form.ownerId,
      dueDate: form.dueDate || "",
      status: form.status,
      priority: form.priority,
      source: form.source,
    });
    setShowAdd(false);
    setVersion((v) => v + 1);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไป Dashboard
        </Link>

        {/* Colored Section Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                4 · NCR / CAR — การแก้ไขและป้องกัน
              </h1>
              <p className="mt-0.5 text-sm text-blue-100">{t.ncrCar.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Stat Boxes + Donut Chart */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-stretch">
          {/* Stat Boxes */}
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {statBoxes.map((box) => (
              <div
                key={box.label}
                className={cn(
                  "relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-800",
                  box.borderColor
                )}
              >
                <div className={cn("absolute left-0 top-0 h-1 w-full", box.color)} />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {box.label}
                </p>
                <p className={cn("mt-1 text-2xl font-bold", box.textColor)}>
                  {box.value}
                </p>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 xl:w-72">
            <DonutChart data={donutData} centerLabel={actions.length.toString()} />
          </div>
        </div>

        {/* Toolbar: Filters + Actions + View Toggle */}
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadCsv(
                  "ncr-car",
                  ["ID", "Ref", "Title", "Department", "Owner", "DueDate", "Status", "Priority", "Source"],
                  actions.map((a) => [a.id, a.referenceNo, a.title, a.departmentId, a.ownerId, a.dueDate, a.status, a.priority, a.source])
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <Download className="h-3.5 w-3.5" />
              {t.common.export}
            </button>
            <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              {t.common.addNew}
            </button>
            <div className="ml-1 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-700">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                  viewMode === "kanban"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {viewMode === "kanban" && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex gap-3 p-4" style={{ minWidth: "1200px" }}>
              {KANBAN_COLUMNS.map((col) => {
                const colActions = getActionsForColumn(col.key);
                return (
                  <div key={col.key} className="min-w-[190px] flex-1">
                    <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {col.label}
                      </h3>
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-600 dark:bg-slate-600 dark:text-slate-200">
                        {colActions.length}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "min-h-[200px] space-y-2 rounded-lg p-1 transition",
                        draggedId ? "bg-blue-50/50 ring-2 ring-blue-200 ring-offset-1 dark:bg-blue-900/10 dark:ring-blue-800" : ""
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, col.key)}
                    >
                      {colActions.map((action) => (
                        <button
                          key={action.id}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, action.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => router.push(`/ncr-car/${action.id}`)}
                          className={cn(
                            "w-full rounded-lg border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-700",
                            draggedId === action.id ? "opacity-40 scale-95" : ""
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-bold text-slate-400">{action.referenceNo}</span>
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
                          <p className="mt-1.5 text-xs font-medium text-slate-700 line-clamp-2 dark:text-slate-200">
                            {action.title}
                          </p>
                          <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400">
                              {departments.find((d) => d.id === action.departmentId)?.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">{action.dueDate}</span>
                          </div>
                        </button>
                      ))}
                      {colActions.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-[10px] text-slate-400 dark:border-slate-700">
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
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.ncrCar.allRecords}</h3>
              <p className="text-xs text-slate-400">{t.ncrCar.completeList}</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => router.push(`/ncr-car/${action.id}`)}
                  className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-blue-50/40 dark:hover:bg-slate-700/50"
                >
                  <span
                    className={cn(
                      "h-8 w-1 rounded-full",
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
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{action.title}</p>
                  </div>
                  <div className="hidden flex-col items-end gap-1 text-xs text-slate-400 sm:flex">
                    <span>{departments.find((d) => d.id === action.departmentId)?.name}</span>
                    <span className="font-medium">{action.dueDate}</span>
                  </div>
                </button>
              ))}
              {actions.length === 0 && (
                <EmptyState title={t.ncrCar.noItems} description={t.ncrCar.noItems} />
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t.ncrCar.newNcrCarTitle} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.ncrCar.fieldTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldDescription}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldDepartment}</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldOwner}</label>
              <select
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldDueDate}</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldPriority}</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="low">{t.priority.low}</option>
                <option value="medium">{t.priority.medium}</option>
                <option value="high">{t.priority.high}</option>
                <option value="critical">{t.priority.critical}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldStatus}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="open">{t.status.open}</option>
                <option value="root_cause">{t.status.root_cause}</option>
                <option value="action_planned">{t.status.action_planned}</option>
                <option value="action_in_progress">{t.status.action_in_progress}</option>
                <option value="follow_up">{t.status.follow_up}</option>
                <option value="closed">{t.status.closed}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.ncrCar.fieldSource}</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => setShowAdd(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <CheckCircle className="h-4 w-4" />
            {t.common.save}
          </button>
        </div>
      </Modal>
    </div>
  );
}
