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

export default function DocumentControlView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();

  const kpis = useMemo(() => documentRepo.getKpis(filters), [filters]);
  const documents = useMemo(() => documentRepo.findAll(filters), [filters]);

  const columns: Column<DocumentRecord>[] = [
    { key: "code", header: "Document ID", sortable: true },
    { key: "title", header: "Title", sortable: true },
    { key: "type", header: "Type", sortable: true },
    {
      key: "departmentId",
      header: "Department",
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    { key: "revision", header: "Revision" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "ownerId",
      header: "Owner",
      render: (item) => item.ownerId,
    },
    { key: "reviewDate", header: "Review Date", sortable: true },
    {
      key: "approvalStatus",
      header: "Approval",
      render: (item) => <StatusBadge status={item.approvalStatus} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Document Control</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage controlled documents, revisions and approvals
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard title="Total Documents" value={kpis.total} href="/documents" icon={<FileText className="h-6 w-6" />} />
          <KPICard title="Active" value={kpis.active} status="good" icon={<CheckCircle className="h-6 w-6" />} />
          <KPICard title="Due Review" value={kpis.dueReview} status={kpis.dueReview > 3 ? "warning" : "good"} icon={<Clock className="h-6 w-6" />} />
          <KPICard title="Pending Approval" value={kpis.pendingApproval} status="warning" icon={<Clock className="h-6 w-6" />} />
          <KPICard title="Overdue Review" value={kpis.overdueReview} status={kpis.overdueReview > 0 ? "danger" : "good"} icon={<AlertTriangle className="h-6 w-6" />} />
          <KPICard title="Obsolete" value={kpis.obsolete} icon={<FileText className="h-6 w-6" />} />
        </div>

        {/* Document Table */}
        <Panel title="Document Register" subtitle="All controlled documents" className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={documents as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/documents/${(item as unknown as DocumentRecord).id}`)}
              searchPlaceholder="Search documents..."
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
