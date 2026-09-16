"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { actionRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { findings } from "@/data/mock/findings";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowLeft, Calendar, User, Building, AlertTriangle } from "lucide-react";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.carId as string;

  const action = useMemo(() => actionRepo.findById(id), [id]);
  const finding = useMemo(() => {
    if (!action?.findingId) return null;
    return findings.find((f) => f.id === action.findingId) || null;
  }, [action]);

  if (!action) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">NCR/CAR not found</p>
        <button onClick={() => router.push("/ncr-car")} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Back to NCR/CAR
        </button>
      </div>
    );
  }

  const isOverdue = new Date(action.dueDate) < new Date() && action.status !== "closed" && action.status !== "verified";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1000px]">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/ncr-car")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to NCR/CAR
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {action.referenceNo}
                </span>
                <StatusBadge status={action.status} size="md" />
                {isOverdue && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    OVERDUE
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{action.title}</h1>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              Owner
            </div>
            <p className="mt-2 font-semibold text-slate-900">{action.ownerId}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Building className="h-4 w-4" />
              Department
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {departments.find((d) => d.id === action.departmentId)?.name || action.departmentId}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              Due Date
            </div>
            <p className={`mt-2 font-semibold ${isOverdue ? "text-red-600" : "text-slate-900"}`}>
              {action.dueDate}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              Priority
            </div>
            <p className="mt-2 font-semibold text-slate-900">{action.priority}</p>
          </div>
        </div>

        {/* Description */}
        <Panel title="Description" className="mt-6">
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{action.description}</p>
        </Panel>

        {/* Finding */}
        {finding && (
          <Panel title="Related Finding" className="mt-4">
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">{finding.title}</span>
                <StatusBadge status={finding.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{finding.description}</p>
              {finding.rootCause && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-700">Root Cause</p>
                  <p className="mt-1 text-sm text-amber-800">{finding.rootCause}</p>
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* Source */}
        <Panel title="Source Information" className="mt-4">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Source</p>
              <p className="mt-1 font-semibold text-slate-900">{action.source}</p>
            </div>
            <div>
              <p className="text-slate-500">Created</p>
              <p className="mt-1 font-semibold text-slate-900">{action.createdAt}</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
