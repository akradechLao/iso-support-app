"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { legalRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { LegalRequirement } from "@/types";
import { Scale, CheckCircle, XCircle, Clock } from "lucide-react";

export default function LegalComplianceView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();

  const kpis = useMemo(() => legalRepo.getKpis(filters), [filters]);
  const legal = useMemo(() => legalRepo.findAll(filters), [filters]);

  const byType = useMemo(() => {
    const map: Record<string, { total: number; comply: number }> = {};
    legal.forEach((l) => {
      if (!map[l.type]) map[l.type] = { total: 0, comply: 0 };
      map[l.type].total++;
      if (l.status === "compliant") map[l.type].comply++;
    });
    return Object.entries(map).map(([type, data]) => ({
      type,
      ...data,
      rate: data.total > 0 ? Math.round((data.comply / data.total) * 100) : 0,
    }));
  }, [legal]);

  const columns: Column<LegalRequirement>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "law", header: "Law / Regulation", sortable: true },
    { key: "type", header: "Type", sortable: true },
    {
      key: "departmentId",
      header: "Department",
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Legal Compliance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Legal requirements tracking and compliance status
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Total Requirements" value={kpis.total} href="/legal-compliance" icon={<Scale className="h-6 w-6" />} />
          <KPICard title="Compliant" value={kpis.comply} status="good" icon={<CheckCircle className="h-6 w-6" />} />
          <KPICard title="Non-Compliant" value={kpis.nonComply} status={kpis.nonComply > 0 ? "danger" : "good"} icon={<XCircle className="h-6 w-6" />} />
          <KPICard title="Pending Assessment" value={kpis.pending} status="warning" icon={<Clock className="h-6 w-6" />} />
          <KPICard title="Compliance Rate" value={`${kpis.complianceRate}%`} status={kpis.complianceRate >= 90 ? "good" : "warning"} icon={<Scale className="h-6 w-6" />} />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {/* Compliance by Type */}
          <Panel title="Compliance by Law Type" subtitle="Breakdown by category">
            <div className="mt-4 space-y-4">
              {byType.map((item) => (
                <div key={item.type}>
                  <ProgressBar
                    label={`${item.type} (${item.comply}/${item.total})`}
                    value={item.rate}
                    color={item.rate >= 90 ? "#10b981" : item.rate >= 70 ? "#f59e0b" : "#ef4444"}
                  />
                </div>
              ))}
            </div>
          </Panel>

          {/* Overall Status */}
          <Panel title="Overall Compliance Status" subtitle="Summary of all requirements">
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-3xl font-black text-emerald-700">{kpis.comply}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">Compliant</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <p className="text-3xl font-black text-red-700">{kpis.nonComply}</p>
                  <p className="mt-1 text-xs font-medium text-red-600">Non-Compliant</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-3xl font-black text-amber-700">{kpis.pending}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600">Pending</p>
                </div>
              </div>
              <div className="mt-6">
                <ProgressBar
                  label="Overall Compliance Rate"
                  value={kpis.complianceRate}
                  color="#10b981"
                  size="lg"
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* Legal Register Table */}
        <Panel title="Legal Register" subtitle="All legal requirements" className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={legal as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/legal-compliance/${(item as unknown as LegalRequirement).id}`)}
              searchPlaceholder="Search legal requirements..."
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
