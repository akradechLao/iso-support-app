"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo, documentRepo, auditRepo, legalRepo, riskRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
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
import { useI18n } from "@/i18n/I18nContext";

export default function ExecutiveDashboard() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const actionKpis = useMemo(() => actionRepo.getKpis(filters), [filters]);
  const documentKpis = useMemo(() => documentRepo.getKpis(filters), [filters]);
  const auditKpis = useMemo(() => auditRepo.getKpis(filters), [filters]);
  const legalKpis = useMemo(() => legalRepo.getKpis(filters), [filters]);
  const riskKpis = useMemo(() => riskRepo.getKpis(filters), [filters]);
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(), []);

  const overdueActions = useMemo(() => actionRepo.findOverdue(), []);

  const standardCompletionRates = useMemo(() => {
    const standards = ["9001", "14001", "45001"];
    return standards.map((standardId) => {
      const auditsForStandard = auditRepo.findByStandard(standardId);
      const completed = auditsForStandard.filter((a) => a.status === "closed").length;
      const total = auditsForStandard.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        standard: standardId,
        rate,
        label: `ISO ${standardId}`,
        color: standardId === "9001" ? "#2563eb" : standardId === "14001" ? "#10b981" : "#f59e0b",
      };
    });
  }, []);

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

  if (loading) return <LoadingSpinner fullPage />;

  if (!recentActions.length && !modulePerformance.length) {
    return <EmptyState description={t.common.noData} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t.dashboard.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{t.dashboard.subtitle}</p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <KPICard
            title={t.dashboard.overallProgress}
            value={`${auditKpis.completionRate}%`}
            subtitle={t.dashboard.overallProgressSubtitle.replace("{completed}", String(auditKpis.completed)).replace("{total}", String(auditKpis.total))}
            trend="up"
            trendValue="+5% vs last quarter"
            href="/iso-progress"
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <KPICard
            title={t.dashboard.openFindings}
            value={riskKpis.total}
            subtitle={t.dashboard.openFindingsSubtitle.replace("{high}", String(riskKpis.high))}
            status={riskKpis.high > 3 ? "danger" : "warning"}
            href="/risks"
            icon={<Shield className="h-6 w-6" />}
          />
          <KPICard
            title={t.dashboard.openNcrCar}
            value={actionKpis.open}
            subtitle={t.dashboard.openNcrCarSubtitle.replace("{overdue}", String(actionKpis.overdue))}
            status={actionKpis.overdue > 0 ? "danger" : "warning"}
            href="/ncr-car"
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          <KPICard
            title={t.dashboard.overdueActions}
            value={actionKpis.overdue}
            subtitle={t.dashboard.overdueActionsSubtitle.replace("{critical}", String(actionKpis.critical))}
            status={actionKpis.overdue > 0 ? "danger" : "good"}
            href="/alerts?status=overdue"
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          <KPICard
            title={t.dashboard.complianceRate}
            value={`${legalKpis.complianceRate}%`}
            subtitle={t.dashboard.complianceRateSubtitle.replace("{nonComply}", String(legalKpis.nonComply))}
            status={legalKpis.nonComply > 0 ? "warning" : "good"}
            href="/legal-compliance"
            icon={<Scale className="h-6 w-6" />}
          />
          <KPICard
            title={t.dashboard.documentsActive}
            value={documentKpis.active}
            subtitle={t.dashboard.documentsActiveSubtitle.replace("{dueReview}", String(documentKpis.dueReview))}
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
                <p className="text-sm font-semibold text-blue-200">{t.dashboard.systemHealth}</p>
                <p className="mt-1 text-sm text-slate-400">{t.dashboard.systemHealthDesc}</p>
              </div>
              <span className="h-fit rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                {actionKpis.overdue === 0 ? t.dashboard.healthy : t.dashboard.attention}
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
                      {auditKpis.completionRate >= 80 ? t.common.healthy : t.common.needsAttention}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-4">
                {standardCompletionRates.map((standard) => (
                  <ProgressBar
                    key={standard.standard}
                    label={standard.label}
                    value={standard.rate}
                    color={standard.color}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">{t.dashboard.openNcrCar}</p>
                <p className="mt-1 text-xl font-black">{actionKpis.open}</p>
                <p className="mt-1 text-[11px] text-rose-300">{actionKpis.overdue} {t.common.overdue}</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">{t.dashboard.legalCompliance}</p>
                <p className="mt-1 text-xl font-black">{legalKpis.complianceRate}%</p>
                <p className="mt-1 text-[11px] text-slate-400">{legalKpis.nonComply} {t.dashboard.nonCompliant}</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">{t.audits.auditCompletion}</p>
                <p className="mt-1 text-xl font-black">{auditKpis.completionRate}%</p>
                <p className="mt-1 text-[11px] text-slate-400">{auditKpis.completed} / {auditKpis.total} {t.common.complete}</p>
              </div>
              <div className="p-3.5">
                <p className="text-[11px] text-slate-400">{t.dashboard.documentStatus}</p>
                <p className="mt-1 text-xl font-black">{documentKpis.active}</p>
                <p className="mt-1 text-[11px] text-slate-400">{documentKpis.dueReview} {t.dashboard.dueReview}</p>
              </div>
            </div>
          </div>

          {/* Right - Management Attention */}
          <Panel title={t.dashboard.managementAttention} subtitle={t.dashboard.managementAttentionDesc}>
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
              {t.dashboard.viewActionCenter}
            </button>
          </Panel>
        </div>

        {/* Second Row */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr_.9fr]">
          {/* Module Performance */}
          <Panel title={t.dashboard.performanceByModule} subtitle={t.dashboard.operationalDrilldown}>
            <div className="mt-5">
              <BarChart data={modulePerformance} height={250} />
            </div>
          </Panel>

          {/* Risk Heatmap */}
          <Panel title={t.dashboard.riskHeatmap} subtitle={t.dashboard.likelihoodImpact}>
            <div className="mt-5">
              <RiskHeatmap
                data={heatmapData}
                onCellClick={(l, i, count) => {
                  if (count > 0) router.push(`/risks?likelihood=${l}&impact=${i}`);
                }}
              />
            </div>
            <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              <b>{t.dashboard.highRisksNeedPlan.replace("{count}", String(riskKpis.high))}</b>
            </p>
          </Panel>

          {/* Document Status */}
          <Panel title={t.dashboard.documentStatus} subtitle={t.dashboard.documentControlOverview}>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{t.dashboard.activeDocuments}</span>
                <span className="font-bold text-slate-900">{documentKpis.active}</span>
              </div>
              <ProgressBar label={t.dashboard.published} value={documentKpis.active} max={documentKpis.total} color="#2563eb" />
              <ProgressBar label={t.dashboard.dueReview} value={documentKpis.dueReview} max={documentKpis.total} color="#f59e0b" />
              <ProgressBar label={t.dashboard.pendingApproval} value={documentKpis.pendingApproval} max={documentKpis.total} color="#8b5cf6" />
              <ProgressBar label={t.dashboard.obsolete} value={documentKpis.obsolete} max={documentKpis.total} color="#94a3b8" />
              <button
                onClick={() => router.push("/documents")}
                className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                {t.dashboard.viewAllDocuments}
              </button>
            </div>
          </Panel>
        </div>

        {/* Third Row - Legal + Audit Summary */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Legal Compliance Summary */}
          <Panel title={t.dashboard.legalCompliance} subtitle={t.dashboard.complianceStatusOverview}>
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">{legalKpis.comply}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">{t.dashboard.compliant}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <p className="text-2xl font-black text-red-700">{legalKpis.nonComply}</p>
                  <p className="mt-1 text-xs font-medium text-red-600">{t.dashboard.nonCompliant}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-2xl font-black text-amber-700">{legalKpis.pending}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600">{t.dashboard.pending}</p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar
                  label={t.dashboard.overallCompliance}
                  value={legalKpis.complianceRate}
                  color="#10b981"
                  size="lg"
                />
              </div>
              <button
                onClick={() => router.push("/legal-compliance")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                {t.dashboard.viewLegalRegister}
              </button>
            </div>
          </Panel>

          {/* Audit Summary */}
          <Panel title={t.dashboard.internalAudit} subtitle={t.dashboard.auditPlanAndFindings}>
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-blue-50 p-4 text-center">
                  <p className="text-2xl font-black text-blue-700">{auditKpis.completed}</p>
                  <p className="mt-1 text-xs font-medium text-blue-600">{t.dashboard.completed}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-2xl font-black text-amber-700">{auditKpis.planned}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600">{t.dashboard.planned}</p>
                </div>
                <div className="rounded-xl bg-violet-50 p-4 text-center">
                  <p className="text-2xl font-black text-violet-700">{auditKpis.inProgress}</p>
                  <p className="mt-1 text-xs font-medium text-violet-600">{t.dashboard.inProgress}</p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar
                  label={t.dashboard.auditCompletion}
                  value={auditKpis.completionRate}
                  color="#3b82f6"
                  size="lg"
                />
              </div>
              <button
                onClick={() => router.push("/audits")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                {t.dashboard.viewAuditSchedule}
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
