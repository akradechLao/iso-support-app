"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { auditRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { standards } from "@/data/mock/standards";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Audit } from "@/types";
import { ClipboardCheck, TrendingUp, Clock, CheckCircle, Download, Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/i18n/I18nContext";

export default function AuditDashboard() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => auditRepo.getKpis(filters), [filters]);
  const audits = useMemo(() => auditRepo.findAll(filters), [filters]);

  const findingsBySeverity = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    audits.forEach((a) => {
      // Simulate findings severity distribution
      if (a.findingCount > 0) {
        counts.critical += Math.floor(a.findingCount * 0.2);
        counts.high += Math.floor(a.findingCount * 0.3);
        counts.medium += Math.floor(a.findingCount * 0.3);
        counts.low += a.findingCount - counts.critical - counts.high - counts.medium;
      }
    });
    return counts;
  }, [audits]);

  const columns: Column<Audit>[] = [
    { key: "id", header: t.audits.auditId, sortable: true },
    { key: "title", header: t.audits.scope, sortable: true },
    {
      key: "standardId",
      header: t.audits.standard,
      render: (item) => {
        const std = standards.find((s) => s.id === item.standardId);
        return std?.code || item.standardId;
      },
    },
    {
      key: "departmentId",
      header: t.audits.department,
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    { key: "plannedDate", header: t.audits.plannedDate, sortable: true },
    {
      key: "status",
      header: t.audits.status,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "findingCount",
      header: t.audits.findings,
      render: (item) => (
        <span className={`font-bold ${item.findingCount > 2 ? "text-red-600" : item.findingCount > 0 ? "text-amber-600" : "text-slate-400"}`}>
          {item.findingCount}
        </span>
      ),
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{t.audits.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.audits.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterBar filters={filters} onChange={setFilters} departments={departments} />
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Download className="h-4 w-4" />
              {t.common.export}
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t.common.addNew}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title={t.audits.auditCompletion}
            value={`${kpis.completionRate}%`}
            subtitle={t.audits.auditCompletionSubtitle.replace("{completed}", String(kpis.completed)).replace("{total}", String(kpis.total))}
            trend="up"
            href="/audits"
            icon={<ClipboardCheck className="h-6 w-6" />}
          />
          <KPICard
            title={t.audits.completed}
            value={kpis.completed}
            status="good"
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <KPICard
            title={t.audits.planned}
            value={kpis.planned}
            status="warning"
            icon={<Clock className="h-6 w-6" />}
          />
          <KPICard
            title={t.audits.inProgress}
            value={kpis.inProgress}
            status="warning"
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {/* Findings by Severity */}
          <Panel title={t.audits.findingsBySeverity} subtitle={t.audits.findingsDistribution}>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">{t.audits.critical}</span>
                <span className="font-bold text-red-700">{findingsBySeverity.critical}</span>
              </div>
              <ProgressBar value={findingsBySeverity.critical} max={20} color="#ef4444" size="sm" showValue={false} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-600">{t.audits.high}</span>
                <span className="font-bold text-orange-700">{findingsBySeverity.high}</span>
              </div>
              <ProgressBar value={findingsBySeverity.high} max={20} color="#f97316" size="sm" showValue={false} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-600">{t.audits.medium}</span>
                <span className="font-bold text-amber-700">{findingsBySeverity.medium}</span>
              </div>
              <ProgressBar value={findingsBySeverity.medium} max={20} color="#f59e0b" size="sm" showValue={false} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-600">{t.audits.low}</span>
                <span className="font-bold text-emerald-700">{findingsBySeverity.low}</span>
              </div>
              <ProgressBar value={findingsBySeverity.low} max={20} color="#10b981" size="sm" showValue={false} />
            </div>
          </Panel>

          {/* Audit by Standard */}
          <Panel title={t.audits.auditsByStandard} subtitle={t.audits.coverageAcrossStandards}>
            <div className="mt-4 space-y-4">
              {standards.map((std) => {
                const stdAudits = audits.filter((a) => a.standardId === std.id);
                const completed = stdAudits.filter((a) => a.status === "closed").length;
                const rate = stdAudits.length > 0 ? Math.round((completed / stdAudits.length) * 100) : 0;
                return (
                  <div key={std.id}>
                    <ProgressBar
                      label={`${std.code} (${completed}/${stdAudits.length})`}
                      value={rate}
                      color="#3b82f6"
                    />
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Upcoming Audits */}
          <Panel title={t.audits.upcomingAudits} subtitle={t.audits.nextPlannedAudits}>
            <div className="mt-4 space-y-2">
              {audits
                .filter((a) => a.status === "planned")
                .slice(0, 5)
                .map((audit) => (
                  <button
                    key={audit.id}
                    onClick={() => router.push(`/audits/${audit.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-slate-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{audit.title}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{audit.plannedDate}</p>
                    </div>
                    <StatusBadge status={audit.status} />
                  </button>
                ))}
            </div>
          </Panel>
        </div>

        {/* Audit List */}
        <Panel title={t.audits.auditRegister} subtitle={t.audits.allFindings} className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={audits as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/audits/${(item as unknown as Audit).id}`)}
              searchPlaceholder={t.audits.searchAudits}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
