"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { auditRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { standards } from "@/data/mock/standards";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { ArrowLeft, Calendar, User, Building, ClipboardCheck } from "lucide-react";

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.auditId ?? "") as string;

  const audit = useMemo(() => auditRepo.findById(id), [id]);

  if (!audit) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Audit not found</p>
        <button onClick={() => router.push("/audits")} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Back to Audits
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6">
          <button
            onClick={() => router.push("/audits")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Audits
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {audit.id}
                </span>
                <StatusBadge status={audit.status} size="md" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{audit.title}</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ClipboardCheck className="h-4 w-4" />
              Standard
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {standards.find((s) => s.id === audit.standardId)?.code || audit.standardId}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Building className="h-4 w-4" />
              Department
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {departments.find((d) => d.id === audit.departmentId)?.name || audit.departmentId}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              Planned Date
            </div>
            <p className="mt-2 font-semibold text-slate-900">{audit.plannedDate}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              Auditor
            </div>
            <p className="mt-2 font-semibold text-slate-900">{audit.auditorId}</p>
          </div>
        </div>

        <Panel title="Audit Information" className="mt-6">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Scope</p>
              <p className="mt-1 font-semibold text-slate-900">{audit.scope}</p>
            </div>
            <div>
              <p className="text-slate-500">Findings</p>
              <p className="mt-1 font-semibold text-slate-900">{audit.findingCount} findings</p>
            </div>
            {audit.completedDate && (
              <div>
                <p className="text-slate-500">Completed Date</p>
                <p className="mt-1 font-semibold text-slate-900">{audit.completedDate}</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
