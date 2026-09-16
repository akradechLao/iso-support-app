"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo, documentRepo, auditRepo, legalRepo, riskRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import RiskHeatmap from "@/components/charts/RiskHeatmap";
import BarChart from "@/components/charts/BarChart";
import {
  AlertTriangle,
  FileText,
  ClipboardCheck,
  Scale,
  Shield,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function ExecutiveDashboard() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();

  const actionKpis = useMemo(() => actionRepo.getKpis(filters), [filters]);
  const documentKpis = useMemo(() => documentRepo.getKpis(filters), [filters]);
  const auditKpis = useMemo(() => auditRepo.getKpis(filters), [filters]);
  const legalKpis = useMemo(() => legalRepo.getKpis(filters), [filters]);
  const riskKpis = useMemo(() => riskRepo.getKpis(filters), [filters]);
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(), []);

  const overdueActions = useMemo(() => actionRepo.findOverdue(), []);

  const modulePerformance = useMemo(
    () => [
      { name: "Documents", value: Math.round((documentKpis.active / Math.max(documentKpis.total, 1)) * 100), color: "#2563eb" },
      { name: "Legal Compliance", value: legalKpis.complianceRate, color: "#10b981" },
      { name: "Internal Audit", value: auditKpis.completionRate, color: "#f59e0b" },
      { name: "CAPA Closure", value: Math.round((actionKpis.closed / Math.max(actionKpis.total, 1)) * 100), color: "#ef4444" },
    ],
    [documentKpis, legalKpis, auditKpis, actionKpis]
  );

  const recentActions = useMemo(() => {
    return actionRepo.findAll(filters).slice(0, 8);
  }, [filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Executive Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">ISO management overview and key performance indicators</p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <KPICard
            title="Overall Progress"
            value={`${auditKpis.completionRate}%`}
            subtitle={`${auditKpis.completed}/${auditKpis.total} audits`}
            trend="up"
            trendValue="+5% vs last quarter"
            href="/iso-progress"
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <KPICard
            title="Open Findings"
            value={riskKpis.total}
            subtitle={`${riskKpis.high} high risk`}
            status={riskKpis.high > 3 ? "danger" : "warning"}
            href="/risks"
            icon={<Shield className="h-6 w-6" />}
          />
          <KPICard
            title="Open NCR/CAR"
            value={actionKpis.open}
            subtitle={`${actionKpis.overdue} overdue`}
            status={actionKpis.overdue > 0 ? "danger" : "warning"}
            href="/ncr-car"
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          <KPICard
            title="Overdue Actions"
            value={actionKpis.overdue}
            subtitle={`${actionKpis.critical} critical`}
            status={actionKpis.overdue > 0 ? "danger" : "good"}
            href="/alerts?status=overdue"
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          <KPICard
            title="Compliance Rate"
            value={`${legalKpis.complianceRate}%`}
            subtitle={`${legalKpis.nonComply} non-compliant`}
            status={legalKpis.nonComply > 0 ? "warning" : "good"}
            href="/legal-compliance"
            icon={<Scale className="h-6 w-6" />}
          />
          <KPICard
            title="Documents Active"
            value={documentKpis.active}
            subtitle={`${documentKpis.dueReview} due review`}
            status={documentKpis.dueReview > 3 ? "warning" : "good"}
            href="/documents"
            icon={<FileText className="h-6 w-6" />}
          />
        </div>

        {/* Main Content */}
        <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
          {/* Left - System Health */}
          <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/15 sm:p-7">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-200">System Health Score</p>
                <p className="mt-1 text-sm text-slate-400">Requirements, evidence and corrective actions in one view</p>
              </div>
              <span className="h-fit rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                {actionKpis.overdue === 0 ? "● Healthy" : "● Attention"}
              </span>
            </div>

            <div className="mt-6 grid items-end gap-6 sm:grid-cols-[180px_1fr]">
              <div
                className="relative grid aspect-square max-w-[175px] place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#5eead4 ${auditKpis.completionRate * 3.6}deg, #28354d 0deg)`,
                }}
              >
                <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-slate-950 text-center">
                  <div>
                    <strong className="text-5xl tracking-tighter">{auditKpis.completionRate}</strong>
                    <span className="text-xl text-slate-400">%</span>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                      {auditKpis.completionRate >= 80 ? "Healthy" : "Needs Attention"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-4">
                <ProgressBar label="ISO 9001" value={91} color="#2563eb" />
                <ProgressBar label="ISO 14001" value={84} color="#10b981" />
                <ProgressBar label="ISO 45001" value={86} color="#f59e0b" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">Open NC / CAR</p>
                <p className="mt-1 text-xl font-black">{actionKpis.open}</p>
                <p className="mt-1 text-[11px] text-rose-300">{actionKpis.overdue} overdue</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">Legal compliance</p>
                <p className="mt-1 text-xl font-black">{legalKpis.complianceRate}%</p>
                <p className="mt-1 text-[11px] text-slate-400">{legalKpis.nonComply} non-compliant</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">Audit coverage</p>
                <p className="mt-1 text-xl font-black">{auditKpis.completionRate}%</p>
                <p className="mt-1 text-[11px] text-slate-400">{auditKpis.completed} / {auditKpis.total} complete</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">Documents</p>
                <p className="mt-1 text-xl font-black">{documentKpis.active}</p>
                <p className="mt-1 text-[11px] text-slate-400">{documentKpis.dueReview} due review</p>
              </div>
            </div>
          </div>

          {/* Right - Management Attention */}
          <Panel title="Management Attention" subtitle="Prioritized by risk, impact & due date">
            <div className="mt-4 space-y-2">
              {recentActions.slice(0, 6).map((action) => (
                <button
                  key={action.id}
                  onClick={() => router.push(`/ncr-car/${action.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span
                    className={`h-10 w-1 rounded-full ${
                      action.priority === "critical"
                        ? "bg-rose-500"
                        : action.priority === "high"
                        ? "bg-amber-400"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{action.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {action.id} · {departments.find((d) => d.id === action.departmentId)?.name}
                    </span>
                  </span>
                  <StatusBadge status={action.status} />
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/alerts")}
              className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              View action center →
            </button>
          </Panel>
        </div>

        {/* Second Row */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr_.9fr]">
          {/* Module Performance */}
          <Panel title="Performance by Module" subtitle="Operational drill-down">
            <div className="mt-5">
              <BarChart data={modulePerformance} height={250} />
            </div>
          </Panel>

          {/* Risk Heatmap */}
          <Panel title="Risk Heatmap" subtitle="Likelihood × Impact">
            <div className="mt-5">
              <RiskHeatmap
                data={heatmapData}
                onCellClick={(l, i, count) => {
                  if (count > 0) router.push(`/risks?likelihood=${l}&impact=${i}`);
                }}
              />
            </div>
            <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              <b>{riskKpis.high} high risks</b> need an assigned treatment plan.
            </p>
          </Panel>

          {/* Document Status */}
          <Panel title="Document Status" subtitle="Document control overview">
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Active documents</span>
                <span className="font-bold text-slate-900">{documentKpis.active}</span>
              </div>
              <ProgressBar label="Published" value={documentKpis.active} max={documentKpis.total} color="#2563eb" />
              <ProgressBar label="Due Review" value={documentKpis.dueReview} max={documentKpis.total} color="#f59e0b" />
              <ProgressBar label="Pending Approval" value={documentKpis.pendingApproval} max={documentKpis.total} color="#8b5cf6" />
              <ProgressBar label="Obsolete" value={documentKpis.obsolete} max={documentKpis.total} color="#94a3b8" />
              <button
                onClick={() => router.push("/documents")}
                className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View all documents →
              </button>
            </div>
          </Panel>
        </div>

        {/* Third Row - Legal + Audit Summary */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Legal Compliance Summary */}
          <Panel title="Legal Compliance" subtitle="Compliance status overview">
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">{legalKpis.comply}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">Compliant</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <p className="text-2xl font-black text-red-700">{legalKpis.nonComply}</p>
                  <p className="mt-1 text-xs font-medium text-red-600">Non-Compliant</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-2xl font-black text-amber-700">{legalKpis.pending}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600">Pending</p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar
                  label="Overall Compliance"
                  value={legalKpis.complianceRate}
                  color="#10b981"
                  size="lg"
                />
              </div>
              <button
                onClick={() => router.push("/legal-compliance")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View legal register →
              </button>
            </div>
          </Panel>

          {/* Audit Summary */}
          <Panel title="Internal Audit" subtitle="Audit plan and findings">
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-blue-50 p-4 text-center">
                  <p className="text-2xl font-black text-blue-700">{auditKpis.completed}</p>
                  <p className="mt-1 text-xs font-medium text-blue-600">Completed</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-2xl font-black text-amber-700">{auditKpis.planned}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600">Planned</p>
                </div>
                <div className="rounded-xl bg-violet-50 p-4 text-center">
                  <p className="text-2xl font-black text-violet-700">{auditKpis.inProgress}</p>
                  <p className="mt-1 text-xs font-medium text-violet-600">In Progress</p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar
                  label="Audit Completion"
                  value={auditKpis.completionRate}
                  color="#3b82f6"
                  size="lg"
                />
              </div>
              <button
                onClick={() => router.push("/audits")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View audit schedule →
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
