"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { legalRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowLeft, Scale, Building, FileText } from "lucide-react";

export default function LegalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.legalId as string;

  const legal = useMemo(() => legalRepo.findById(id), [id]);

  if (!legal) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Legal requirement not found</p>
        <button onClick={() => router.push("/legal-compliance")} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Back to Legal Compliance
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6">
          <button
            onClick={() => router.push("/legal-compliance")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Legal Compliance
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {legal.id}
                </span>
                <StatusBadge status={legal.status} size="md" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{legal.law}</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Scale className="h-4 w-4" />
              Type
            </div>
            <p className="mt-2 font-semibold text-slate-900">{legal.type}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Building className="h-4 w-4" />
              Department
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {departments.find((d) => d.id === legal.departmentId)?.name || legal.departmentId}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FileText className="h-4 w-4" />
              Status
            </div>
            <div className="mt-2"><StatusBadge status={legal.status} /></div>
          </div>
        </div>

        <Panel title="Description" className="mt-6">
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{legal.description}</p>
        </Panel>

        {legal.assessmentDate && (
          <Panel title="Assessment" className="mt-4">
            <div className="mt-3">
              <p className="text-sm text-slate-500">Assessment Date</p>
              <p className="mt-1 font-semibold text-slate-900">{legal.assessmentDate}</p>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
