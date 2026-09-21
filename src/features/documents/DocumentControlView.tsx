"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { documentRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { users } from "@/data/mock/users";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { DocumentRecord } from "@/types";
import { FileText, Clock, CheckCircle, AlertTriangle, Download, Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{t.documents.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.documents.subtitle}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard title={t.documents.totalDocuments} value={kpis.total} href="/documents" icon={<FileText className="h-6 w-6" />} />
          <KPICard title={t.documents.active} value={kpis.active} status="good" icon={<CheckCircle className="h-6 w-6" />} />
          <KPICard title={t.documents.dueReview} value={kpis.dueReview} status={kpis.dueReview > 3 ? "warning" : "good"} icon={<Clock className="h-6 w-6" />} />
          <KPICard title={t.documents.pendingApproval} value={kpis.pendingApproval} status="warning" icon={<Clock className="h-6 w-6" />} />
          <KPICard title={t.documents.overdueReview} value={kpis.overdueReview} status={kpis.overdueReview > 0 ? "danger" : "good"} icon={<AlertTriangle className="h-6 w-6" />} />
          <KPICard title={t.documents.obsolete} value={kpis.obsolete} icon={<FileText className="h-6 w-6" />} />
        </div>

        {/* Document Table */}
        <Panel title={t.documents.documentRegister} subtitle={t.documents.allControlledDocuments} className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={documents as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/documents/${(item as unknown as DocumentRecord).id}`)}
              searchPlaceholder={t.documents.searchDocuments}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
