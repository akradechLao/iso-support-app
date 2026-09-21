"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { documentRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { users } from "@/data/mock/users";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import DonutChart from "@/components/charts/DonutChart";
import { DocumentRecord } from "@/types";
import { FileText, Clock, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/i18n/I18nContext";

export default function DocumentControlView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => documentRepo.getKpis(filters), [filters]);
  const documents = useMemo(() => documentRepo.findAll(filters), [filters]);

  const columns: Column<DocumentRecord>[] = [
    { key: "code", header: t.documents.documentId, sortable: true },
    { key: "title", header: t.documents.title_col, sortable: true },
    { key: "type", header: t.documents.type, sortable: true },
    {
      key: "departmentId",
      header: t.documents.department,
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    { key: "revision", header: t.documents.revision },
    {
      key: "status",
      header: t.documents.status,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "ownerId",
      header: t.documents.owner,
      render: (item) => users.find((u) => u.id === item.ownerId)?.name || item.ownerId,
    },
    { key: "reviewDate", header: t.documents.reviewDate, sortable: true },
    {
      key: "approvalStatus",
      header: t.documents.approval,
      render: (item) => <StatusBadge status={item.approvalStatus} />,
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  const statusData = [
    { name: "Effective", value: kpis.active, color: "#22c55e" },
    { name: "Draft", value: kpis.dueReview, color: "#3b82f6" },
    { name: "Review", value: kpis.pendingApproval, color: "#f59e0b" },
    { name: "Approve", value: kpis.pendingApproval, color: "#f97316" },
    { name: "Obsolete", value: kpis.obsolete, color: "#94a3b8" },
  ];

  const statBoxes = [
    { label: t.documents.totalDocuments, value: kpis.total, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
    { label: t.documents.active, value: kpis.active, color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    { label: t.documents.dueReview, value: kpis.dueReview, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    { label: t.documents.pendingApproval, value: kpis.pendingApproval, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    { label: t.documents.overdueReview, value: kpis.overdueReview, color: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
    { label: t.documents.obsolete, value: kpis.obsolete, color: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-[1540px]">
        {/* Back Link */}
        <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับไป Dashboard
        </Link>

        {/* Section Header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">1</span>
          <h1 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            ควบคุมเอกสาร — Document Control
          </h1>
        </div>

        {/* Compact Stat Boxes */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {statBoxes.map((s) => (
            <div key={s.label} className={`rounded-lg border ${s.border} ${s.color} p-2.5`}>
              <p className="text-[11px] font-medium opacity-80 leading-tight">{s.label}</p>
              <p className="mt-0.5 text-xl font-bold leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart + Legend Row */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status Breakdown</p>
            <div className="flex items-center justify-center">
              <DonutChart data={statusData} showLegend={false} height={180} />
            </div>
          </div>

          {/* Legend + Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status Summary</p>
            <div className="flex flex-col gap-2">
              {statusData.map((item) => {
                const total = statusData.reduce((acc, d) => acc + d.value, 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
                    <span className="w-12 text-right text-[11px] text-slate-400 dark:text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
            </div>
          </div>
        </div>

        {/* Document Table */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.documents.documentRegister}</p>
          </div>
          <div className="p-3">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={documents as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/documents/${(item as unknown as DocumentRecord).id}`)}
              searchPlaceholder={t.documents.searchDocuments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
