"use client";

import { useMemo } from "react";
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
import { ClipboardCheck, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function AuditDashboard() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();

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
    { key: "id", header: "Audit ID", sortable: true },
    { key: "title", header: "Scope", sortable: true },
    {
      key: "standardId",
      header: "Standard",
      render: (item) => {
        const std = standards.find((s) => s.id === item.standardId);
        return std?.code || item.standardId;
      },
    },
    {
      key: "departmentId",
      header: "Department",
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    { key: "plannedDate", header: "Planned Date", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "findingCount",
      header: "Findings",
      render: (item) => (
        <span className={`font-bold ${item.findingCount > 2 ? "text-red-600" : item.findingCount > 0 ? "text-amber-600" : "text-slate-400"}`}>
          {item.findingCount}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Internal Audit</h1>
            <p className="mt-1 text-sm text-slate-500">
              Audit plan completion, coverage and findings analysis
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Audit Completion"
            value={`${kpis.completionRate}%`}
            subtitle={`${kpis.completed}/${kpis.total} audits`}
            trend="up"
            href="/audits"
            icon={<ClipboardCheck className="h-6 w-6" />}
          />
          <KPICard
            title="Completed"
            value={kpis.completed}
            status="good"
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <KPICard
            title="Planned"
            value={kpis.planned}
            status="warning"
            icon={<Clock className="h-6 w-6" />}
          />
          <KPICard
            title="In Progress"
            value={kpis.inProgress}
            status="warning"
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {/* Findings by Severity */}
          <Panel title="Findings by Severity" subtitle="Distribution of audit findings">
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Critical</span>
                <span className="font-bold text-red-700">{findingsBySeverity.critical}</span>
              </div>
              <ProgressBar value={findingsBySeverity.critical} max={20} color="#ef4444" size="sm" showValue={false} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-600">High</span>
                <span className="font-bold text-orange-700">{findingsBySeverity.high}</span>
              </div>
              <ProgressBar value={findingsBySeverity.high} max={20} color="#f97316" size="sm" showValue={false} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-600">Medium</span>
                <span className="font-bold text-amber-700">{findingsBySeverity.medium}</span>
              </div>
              <ProgressBar value={findingsBySeverity.medium} max={20} color="#f59e0b" size="sm" showValue={false} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-600">Low</span>
                <span className="font-bold text-emerald-700">{findingsBySeverity.low}</span>
              </div>
              <ProgressBar value={findingsBySeverity.low} max={20} color="#10b981" size="sm" showValue={false} />
            </div>
          </Panel>

          {/* Audit by Standard */}
          <Panel title="Audits by Standard" subtitle="Coverage across ISO standards">
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
          <Panel title="Upcoming Audits" subtitle="Next planned audits">
            <div className="mt-4 space-y-2">
              {audits
                .filter((a) => a.status === "planned")
                .slice(0, 5)
                .map((audit) => (
                  <button
                    key={audit.id}
                    onClick={() => router.push(`/audits/${audit.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700">{audit.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{audit.plannedDate}</p>
                    </div>
                    <StatusBadge status={audit.status} />
                  </button>
                ))}
            </div>
          </Panel>
        </div>

        {/* Audit List */}
        <Panel title="Audit Register" subtitle="All audits with findings" className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={audits as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/audits/${(item as unknown as Audit).id}`)}
              searchPlaceholder="Search audits..."
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
