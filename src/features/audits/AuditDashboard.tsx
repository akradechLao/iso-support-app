"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { auditRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { standards } from "@/data/mock/standards";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import DonutChart from "@/components/charts/DonutChart";
import BarChart from "@/components/charts/BarChart";
import { Audit } from "@/types";
import { useI18n } from "@/i18n/I18nContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FilterBar from "@/components/ui/FilterBar";

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
      if (a.findingCount > 0) {
        counts.critical += Math.floor(a.findingCount * 0.2);
        counts.high += Math.floor(a.findingCount * 0.3);
        counts.medium += Math.floor(a.findingCount * 0.3);
        counts.low += a.findingCount - counts.critical - counts.high - counts.medium;
      }
    });
    return counts;
  }, [audits]);

  const donutData = useMemo(
    () => [
      { name: "Completed", value: kpis.completed, color: "#10b981" },
      { name: "Planned", value: kpis.planned, color: "#3b82f6" },
      { name: "In Progress", value: kpis.inProgress, color: "#f59e0b" },
    ],
    [kpis]
  );

  const barData = useMemo(
    () => [
      { name: "Critical", value: findingsBySeverity.critical, color: "#ef4444" },
      { name: "High", value: findingsBySeverity.high, color: "#f97316" },
      { name: "Medium", value: findingsBySeverity.medium, color: "#f59e0b" },
      { name: "Low", value: findingsBySeverity.low, color: "#10b981" },
    ],
    [findingsBySeverity]
  );

  const columns: Column<Audit>[] = [
    { key: "id", header: t.audits.auditId, sortable: true },
    { key: "title", header: t.audits.scope, sortable: true },
    {
      key: "standardId",
      header: t.audits.standard,
      render: (item) => standards.find((s) => s.id === item.standardId)?.code || item.standardId,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation */}
        <nav className="mb-4 flex items-center justify-between text-sm">
          <Link href="/" className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            ← กลับไป Dashboard
          </Link>
          <Link href="/progress" className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            ดู ISO Progress →
          </Link>
        </nav>

        {/* Section Header */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 shadow-lg dark:border-blue-800">
          <h1 className="text-xl font-bold tracking-tight text-white">
            การตรวจประเมินภายใน — Internal Audit
          </h1>
        </div>

        <div className="mb-4">
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>

        {/* Stat Boxes */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Audit Plan", value: kpis.total, bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-200 dark:ring-blue-800" },
            { label: "Completed", value: kpis.completed, bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-800" },
            { label: "Pending", value: kpis.planned, bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-800" },
            { label: "In Progress", value: kpis.inProgress, bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-200 dark:ring-violet-800" },
            { label: "Compliance Rate", value: `${kpis.completionRate}%`, bg: "bg-slate-100 dark:bg-slate-800/60", text: "text-slate-800 dark:text-slate-200", ring: "ring-slate-200 dark:ring-slate-700" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl ${stat.bg} ring-1 ${stat.ring} px-4 py-3 text-center transition hover:shadow-md`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-1 text-2xl font-extrabold ${stat.text}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Audit Completion</h2>
            <p className="mb-3 text-xs text-slate-400">Completed / Planned / In Progress</p>
            <DonutChart
              data={donutData}
              centerLabel={String(kpis.total)}
              centerSubLabel="Total Audits"
              height={220}
              innerRadius={55}
              outerRadius={80}
            />
          </div>

          {/* Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Findings by Severity</h2>
            <p className="mb-3 text-xs text-slate-400">Distribution across all audits</p>
            <BarChart data={barData} height={220} />
          </div>
        </div>

        {/* Audit Register Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Audit Register</h2>
          <p className="mb-4 text-xs text-slate-400">All audits across departments</p>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={audits as unknown as Record<string, unknown>[]}
            onRowClick={(item) => router.push(`/audits/${(item as unknown as Audit).id}`)}
            searchPlaceholder={t.audits.searchAudits}
          />
        </div>
      </div>
    </div>
  );
}
