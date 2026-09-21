"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { riskRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import RiskHeatmap from "@/components/charts/RiskHeatmap";
import ProgressBar from "@/components/ui/ProgressBar";
import { Risk } from "@/types";
import { Shield, AlertTriangle, AlertCircle, CheckCircle, Download, Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/i18n/I18nContext";

export default function RiskRegisterView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => riskRepo.getKpis(filters), [filters]);
  const risks = useMemo(() => riskRepo.findAll(filters), [filters]);
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(), []);

  const columns: Column<Risk>[] = [
    { key: "id", header: t.risks.id, sortable: true },
    { key: "title", header: t.risks.riskTitle, sortable: true },
    {
      key: "departmentId",
      header: t.risks.department,
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    {
      key: "inherentScore",
      header: t.risks.inherentRisk,
      sortable: true,
      render: (item) => (
        <span className={`font-bold ${item.inherentScore >= 15 ? "text-red-600" : item.inherentScore >= 10 ? "text-orange-600" : item.inherentScore >= 5 ? "text-amber-600" : "text-emerald-600"}`}>
          {item.inherentScore}
        </span>
      ),
    },
    {
      key: "residualScore",
      header: t.risks.residualRisk,
      sortable: true,
      render: (item) => (
        <span className={`font-bold ${item.residualScore >= 15 ? "text-red-600" : item.residualScore >= 10 ? "text-orange-600" : item.residualScore >= 5 ? "text-amber-600" : "text-emerald-600"}`}>
          {item.residualScore}
        </span>
      ),
    },
    {
      key: "status",
      header: t.risks.status,
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{t.risks.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.risks.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
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
          <KPICard title={t.risks.totalRisks} value={kpis.total} href="/risks" icon={<Shield className="h-6 w-6" />} />
          <KPICard title={t.risks.highRisk} value={kpis.high} status={kpis.high > 3 ? "danger" : "warning"} icon={<AlertTriangle className="h-6 w-6" />} />
          <KPICard title={t.risks.mediumRisk} value={kpis.medium} status="warning" icon={<AlertCircle className="h-6 w-6" />} />
          <KPICard title={t.risks.lowRisk} value={kpis.low} status="good" icon={<CheckCircle className="h-6 w-6" />} />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {/* Risk Heatmap */}
          <Panel title={t.risks.riskHeatmap} subtitle={t.risks.likelihoodImpactMatrix}>
            <div className="mt-5">
              <RiskHeatmap
                data={heatmapData}
                onCellClick={(l, i, count) => {
                  if (count > 0) router.push(`/risks?likelihood=${l}&impact=${i}`);
                }}
              />
            </div>
          </Panel>

          {/* Risk Distribution */}
          <Panel title={t.risks.riskDistribution} subtitle={t.risks.bySeverityLevel}>
            <div className="mt-4 space-y-4">
              <div>
                <ProgressBar label={`${t.risks.highRisk} (${kpis.high})`} value={kpis.high} max={kpis.total} color="#ef4444" />
              </div>
              <div>
                <ProgressBar label={`${t.risks.mediumRisk} (${kpis.medium})`} value={kpis.medium} max={kpis.total} color="#f59e0b" />
              </div>
              <div>
                <ProgressBar label={`${t.risks.lowRisk} (${kpis.low})`} value={kpis.low} max={kpis.total} color="#10b981" />
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-rose-50 dark:bg-rose-900/30 p-3 text-sm text-rose-800 dark:text-rose-200">
              <b>{t.risks.highRisksNeedPlan.replace("{count}", String(kpis.high))}</b>
            </div>
          </Panel>
        </div>

        {/* Risk Register Table */}
        <Panel title={t.risks.riskRegister} subtitle={t.risks.allIdentifiedRisks} className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={risks as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/risks/${(item as unknown as Risk).id}`)}
              searchPlaceholder={t.risks.searchRisks}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
