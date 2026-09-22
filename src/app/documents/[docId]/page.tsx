"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { documentRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowLeft, FileText, Calendar, User, Building, ExternalLink, FolderOpen } from "lucide-react";
import { resolveDccUrl, hasDccLink, DCC_BASE_URL } from "@/lib/dcc";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.docId ?? "") as string;

  const doc = useMemo(() => documentRepo.findById(id), [id]);

  if (!doc) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Document not found</p>
        <button onClick={() => router.push("/documents")} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6">
          <button
            onClick={() => router.push("/documents")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {doc.code}
                </span>
                <StatusBadge status={doc.status} size="md" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{doc.title}</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FileText className="h-4 w-4" />
              Type
            </div>
            <p className="mt-2 font-semibold text-slate-900">{doc.type}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Building className="h-4 w-4" />
              Department
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {departments.find((d) => d.id === doc.departmentId)?.name || doc.departmentId}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              Owner
            </div>
            <p className="mt-2 font-semibold text-slate-900">{doc.ownerId}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              Review Date
            </div>
            <p className="mt-2 font-semibold text-slate-900">{doc.reviewDate}</p>
          </div>
        </div>

        <Panel title="Document Information" className="mt-6">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Revision</p>
              <p className="mt-1 font-semibold text-slate-900">{doc.revision}</p>
            </div>
            <div>
              <p className="text-slate-500">Approval Status</p>
              <div className="mt-1"><StatusBadge status={doc.approvalStatus} /></div>
            </div>
            <div>
              <p className="text-slate-500">Created</p>
              <p className="mt-1 font-semibold text-slate-900">{doc.createdAt}</p>
            </div>
            <div>
              <p className="text-slate-500">Last Updated</p>
              <p className="mt-1 font-semibold text-slate-900">{doc.updatedAt}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Source file (DCC)" className="mt-4">
          {hasDccLink(doc.dccPath) ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate font-mono text-xs text-slate-700">{doc.dccPath}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  เอกสารต้นฉบับอยู่ที่ app.etc1992.com/dcc (ต้อง login ETC)
                </p>
              </div>
              <a
                href={resolveDccUrl(doc.dccPath) || DCC_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <ExternalLink className="h-4 w-4" />
                เปิดใน DCC
              </a>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">ยังไม่ได้ระบุไฟล์ต้นฉบับ</p>
              <a
                href={DCC_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <ExternalLink className="h-4 w-4" />
                เปิด DCC
              </a>
            </div>
          )}
        </Panel>

        {doc.clauseIds.length > 0 && (
          <Panel title="Linked ISO Clauses" className="mt-4">
            <div className="mt-3 flex flex-wrap gap-2">
              {doc.clauseIds.map((clauseId) => (
                <span key={clauseId} className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                  {clauseId}
                </span>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
