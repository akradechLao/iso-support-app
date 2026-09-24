"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { riskRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import RiskHeatmap from "@/components/charts/RiskHeatmap";
import DonutChart from "@/components/charts/DonutChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Risk } from "@/types";
import { Shield, AlertTriangle, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
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
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(filters), [filters]);

  const donutData = useMemo(
    () => [
      { name: "High", value: kpis.high, color: "#ef4444" },
      { name: "Medium", value: kpis.medium, color: "#f59e0b" },
      { name: "Low", value: kpis.low, color: "#10b981" },
    ],
    [kpis]
  );

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
      <div className="mx-auto">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไป Dashboard
        </Link>

        {/* Colored Section Header */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 p-5 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
          <h1 className="text-xl font-bold tracking-tight">
            6 · ความเสี่ยงและโอกาส — Risk &amp; Opportunity
          </h1>
        </div>

        <div className="mb-4">
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>


        {/* Compact Stat Boxes */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Shield className="mx-auto mb-1 h-5 w-5 text-slate-400" />
            <p className="text-2xl font-bold text-slate-950 dark:text-white">{kpis.total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.risks.totalRisks}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center shadow-sm dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-red-500" />
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.high}</p>
            <p className="text-xs text-red-500 dark:text-red-400">{t.risks.highRisk}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
            <AlertCircle className="mx-auto mb-1 h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.medium}</p>
            <p className="text-xs text-amber-500 dark:text-amber-400">{t.risks.mediumRisk}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.low}</p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400">{t.risks.lowRisk}</p>
          </div>
        </div>

        {/* Donut Chart + Heatmap */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Panel title="Risk Distribution" subtitle="By severity level" className="flex flex-col items-center">
            <DonutChart
              data={donutData}
              centerLabel={String(kpis.total)}
              centerSubLabel="Total Risks"
              height={240}
              innerRadius={55}
              outerRadius={85}
            />
          </Panel>
          <Panel title={t.risks.riskHeatmap} subtitle={t.risks.likelihoodImpactMatrix}>
            <RiskHeatmap
              data={heatmapData}
              onCellClick={(l, i, count) => {
                if (count > 0) router.push(`/risks?likelihood=${l}&impact=${i}`);
              }}
            />
          </Panel>
        </div>

        {/* Risk Register Table */}
        <Panel title={t.risks.riskRegister} subtitle={t.risks.allIdentifiedRisks} className="mt-6">
          <div className="mt-3">
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
