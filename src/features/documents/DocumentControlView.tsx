"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { documentRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { DocumentRecord } from "@/types";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function DocumentControlView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();

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
      render: (item) => item.ownerId,
    },
    { key: "reviewDate", header: t.documents.reviewDate, sortable: true },
    {
      key: "approvalStatus",
      header: t.documents.approval,
      render: (item) => <StatusBadge status={item.approvalStatus} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t.documents.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.documents.subtitle}
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
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
