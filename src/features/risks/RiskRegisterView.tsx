"use client";

import { useMemo } from "react";
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
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

export default function RiskRegisterView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();

  const kpis = useMemo(() => riskRepo.getKpis(filters), [filters]);
  const risks = useMemo(() => riskRepo.findAll(filters), [filters]);
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(), []);

  const columns: Column<Risk>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "title", header: "Risk Title", sortable: true },
    {
      key: "departmentId",
      header: "Department",
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    {
      key: "inherentScore",
      header: "Inherent Risk",
      sortable: true,
      render: (item) => (
        <span className={`font-bold ${item.inherentScore >= 15 ? "text-red-600" : item.inherentScore >= 10 ? "text-orange-600" : item.inherentScore >= 5 ? "text-amber-600" : "text-emerald-600"}`}>
          {item.inherentScore}
        </span>
      ),
    },
    {
      key: "residualScore",
      header: "Residual Risk",
      sortable: true,
      render: (item) => (
        <span className={`font-bold ${item.residualScore >= 15 ? "text-red-600" : item.residualScore >= 10 ? "text-orange-600" : item.residualScore >= 5 ? "text-amber-600" : "text-emerald-600"}`}>
          {item.residualScore}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Risk & Opportunity</h1>
            <p className="mt-1 text-sm text-slate-500">
              Risk register, 5×5 heatmap, controls and treatment plans
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Risks" value={kpis.total} href="/risks" icon={<Shield className="h-6 w-6" />} />
          <KPICard title="High Risk" value={kpis.high} status={kpis.high > 3 ? "danger" : "warning"} icon={<AlertTriangle className="h-6 w-6" />} />
          <KPICard title="Medium Risk" value={kpis.medium} status="warning" icon={<AlertCircle className="h-6 w-6" />} />
          <KPICard title="Low Risk" value={kpis.low} status="good" icon={<CheckCircle className="h-6 w-6" />} />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {/* Risk Heatmap */}
          <Panel title="Risk Heatmap" subtitle="Likelihood × Impact matrix">
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
          <Panel title="Risk Distribution" subtitle="By severity level">
            <div className="mt-4 space-y-4">
              <div>
                <ProgressBar label={`High Risk (${kpis.high})`} value={kpis.high} max={kpis.total} color="#ef4444" />
              </div>
              <div>
                <ProgressBar label={`Medium Risk (${kpis.medium})`} value={kpis.medium} max={kpis.total} color="#f59e0b" />
              </div>
              <div>
                <ProgressBar label={`Low Risk (${kpis.low})`} value={kpis.low} max={kpis.total} color="#10b981" />
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              <b>{kpis.high} high risks</b> need an assigned treatment plan.
            </div>
          </Panel>
        </div>

        {/* Risk Register Table */}
        <Panel title="Risk Register" subtitle="All identified risks with controls" className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={risks as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/risks/${(item as unknown as Risk).id}`)}
              searchPlaceholder="Search risks..."
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
