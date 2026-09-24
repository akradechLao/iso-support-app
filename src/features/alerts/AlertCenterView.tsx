"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { users } from "@/data/mock/users";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  Shield,
  ChevronRight,
  CheckCircle2,
  X,
  Paperclip,
  FileText,
  History,
  Pencil,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { isOverdue, parseDate } from "@/lib/date";
import FilterBar from "@/components/ui/FilterBar";

interface LogEntry {
  id: string;
  timestamp: string;
  action: "created" | "edited" | "deleted_attachment";
  userId: string;
  detail: string;
}

interface ResolvedRecord {
  actionId: string;
  userId: string;
  departmentId: string;
  resolvedAt: string;
  resolvedDate: string;
  resolvedTime: string;
  description: string;
  attachments: string[];
  logs: LogEntry[];
}

interface ResolveModal {
  open: boolean;
  mode: "create" | "edit";
  actionId: string | null;
  actionTitle: string;
  referenceNo: string;
}

export default function AlertCenterView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(0);

  const actions = useMemo(() => actionRepo.findAll(filters), [filters, version]);
  const overdueActions = useMemo(() => actionRepo.findOverdue(), [version]);

  const [modal, setModal] = useState<ResolveModal>({
    open: false,
    mode: "create",
    actionId: null,
    actionTitle: "",
    referenceNo: "",
  });
  const [resolveDate, setResolveDate] = useState("");
  const [resolveTime, setResolveTime] = useState("");
  const [resolveUserId, setResolveUserId] = useState("U001");
  const [resolveDept, setResolveDept] = useState("QA");
  const [resolveNotes, setResolveNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [resolvedList, setResolvedList] = useState<ResolvedRecord[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  const sortedActions = useMemo(() => {
    return [...actions].sort((a, b) => {
      const aResolved = a.status === "closed" || a.status === "verified";
      const bResolved = b.status === "closed" || b.status === "verified";
      if (aResolved !== bResolved) return aResolved ? 1 : -1;
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (diff !== 0) return diff;
      const aTime = parseDate(a.dueDate)?.getTime() ?? 0;
      const bTime = parseDate(b.dueDate)?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [actions]);

  const openActions = actions.filter((a) => a.status !== "closed" && a.status !== "verified");
  const criticalCount = openActions.filter((a) => a.priority === "critical").length;
  const pendingCount = actions.filter(
    (a) => a.status === "action_in_progress" || a.status === "follow_up"
  ).length;

  const isResolved = (id: string) => {
    const action = actions.find((a) => a.id === id);
    if (action && (action.status === "closed" || action.status === "verified")) return true;
    return resolvedList.some((r) => r.actionId === id);
  };
  const getRecord = (id: string) => resolvedList.find((r) => r.actionId === id);

  const now = () => {
    const d = new Date();
    return {
      date: d.toISOString().slice(0, 10),
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      datetime: `${d.toISOString().slice(0, 10)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    };
  };

  const openCreateModal = (actionId: string, title: string, refNo: string) => {
    const n = now();
    setResolveDate(n.date);
    setResolveTime(n.time);
    setResolveUserId("U001");
    setResolveDept("QA");
    setResolveNotes("");
    setAttachments([]);
    setModal({ open: true, mode: "create", actionId, actionTitle: title, referenceNo: refNo });
  };

  const openEditModal = (actionId: string) => {
    const record = getRecord(actionId);
    if (!record) return;
    const action = actions.find((a) => a.id === actionId);
    setResolveDate(record.resolvedDate);
    setResolveTime(record.resolvedTime);
    setResolveUserId(record.userId);
    setResolveDept(record.departmentId);
    setResolveNotes(record.description);
    setAttachments([...record.attachments]);
    setModal({
      open: true,
      mode: "edit",
      actionId,
      actionTitle: action?.title || "",
      referenceNo: action?.referenceNo || "",
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create", actionId: null, actionTitle: "", referenceNo: "" });
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setAttachments((prev) => [...prev, ...names]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (filename: string) => {
    setAttachments((prev) => prev.filter((a) => a !== filename));
  };

  const confirmResolve = () => {
    if (!modal.actionId) return;
    const n = now();
    const newLog: LogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: n.datetime,
      action: "created",
      userId: resolveUserId,
      detail: "บันทึกการแก้ไขครั้งแรก",
    };

    if (modal.mode === "create") {
      actionRepo.update(modal.actionId, {
        status: "closed",
        closedAt: `${resolveDate} ${resolveTime}`,
        verification: resolveNotes,
      });
      setResolvedList((prev) => [
        ...prev,
        {
          actionId: modal.actionId!,
          userId: resolveUserId,
          departmentId: resolveDept,
          resolvedAt: `${resolveDate} ${resolveTime}`,
          resolvedDate: resolveDate,
          resolvedTime: resolveTime,
          description: resolveNotes,
          attachments: [...attachments],
          logs: [newLog],
        },
      ]);
      setVersion((v) => v + 1);
      window.dispatchEvent(new Event("actions-updated"));
    } else {
      setResolvedList((prev) =>
        prev.map((r) => {
          if (r.actionId !== modal.actionId) return r;
          const editedLog: LogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: n.datetime,
            action: "edited",
            userId: resolveUserId,
            detail: `แก้ไขข้อมูล: วันที่=${resolveDate} ${resolveTime}, หน่วยงาน=${departments.find((d) => d.id === resolveDept)?.name}, ผู้บันทึก=${users.find((u) => u.id === resolveUserId)?.name}`,
          };
          return {
            ...r,
            userId: resolveUserId,
            departmentId: resolveDept,
            resolvedAt: `${resolveDate} ${resolveTime}`,
            resolvedDate: resolveDate,
            resolvedTime: resolveTime,
            description: resolveNotes,
            attachments: [...attachments],
            logs: [...r.logs, editedLog],
          };
        })
      );
    }
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Nav */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="group flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            <span className="transition group-hover:-translate-x-0.5">←</span>
            กลับไป Dashboard
          </Link>
          <Link href="/ncr-car" className="group flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            ดู NCR/CAR
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-5 shadow-lg shadow-indigo-500/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-black">9</span>
              ศูนย์แจ้งเตือน — Alert &amp; Action Center
            </h1>
            <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <button onClick={() => router.push("/ncr-car?status=overdue")} className="group relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 text-left transition hover:border-red-300 hover:shadow-md dark:border-red-800 dark:from-red-950/50 dark:to-red-900/30 dark:hover:border-red-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">{overdueActions.length}</p>
                <p className="mt-0.5 text-xs font-semibold text-red-600/80 dark:text-red-400/80">Overdue</p>
              </div>
              <div className="rounded-lg bg-red-100 p-1.5 dark:bg-red-900/50"><Clock className="h-4 w-4 text-red-500" /></div>
            </div>
          </button>
          <button onClick={() => router.push("/ncr-car?priority=critical")} className="group relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 text-left transition hover:border-orange-300 hover:shadow-md dark:border-orange-800 dark:from-orange-950/50 dark:to-orange-900/30 dark:hover:border-orange-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{criticalCount}</p>
                <p className="mt-0.5 text-xs font-semibold text-orange-600/80 dark:text-orange-400/80">Critical</p>
              </div>
              <div className="rounded-lg bg-orange-100 p-1.5 dark:bg-orange-900/50"><AlertTriangle className="h-4 w-4 text-orange-500" /></div>
            </div>
          </button>
          <button onClick={() => router.push("/ncr-car?status=in_progress")} className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-left transition hover:border-blue-300 hover:shadow-md dark:border-blue-800 dark:from-blue-950/50 dark:to-blue-900/30 dark:hover:border-blue-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{pendingCount}</p>
                <p className="mt-0.5 text-xs font-semibold text-blue-600/80 dark:text-blue-400/80">Pending</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/50"><Shield className="h-4 w-4 text-blue-500" /></div>
            </div>
          </button>
        </div>

        {/* Action List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">All Actions — Prioritized by Risk</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedActions.map((action) => {
              const isOverdueItem = isOverdue(action.dueDate, action.status);
              const resolved = isResolved(action.id);
              const record = getRecord(action.id);
              const canResolve = action.status !== "closed" && action.status !== "verified";

              return (
                <div key={action.id} className={cn("px-4 py-3 transition", isOverdueItem && !resolved && "bg-red-50/50 dark:bg-red-950/20", resolved && "bg-emerald-50/30 dark:bg-emerald-950/10")}>
                  <div className="flex items-center gap-3">
                    <span className={cn("h-8 w-1 shrink-0 rounded-full", resolved ? "bg-emerald-400" : action.priority === "critical" ? "bg-rose-500" : action.priority === "high" ? "bg-amber-400" : "bg-blue-500")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">{action.referenceNo}</span>
                        <StatusBadge status={resolved ? "closed" : action.status} />
                        {isOverdueItem && !resolved && <span className="rounded-full bg-red-100 px-1.5 py-px text-[10px] font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">OVERDUE</span>}
                        {resolved && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><CheckCircle2 className="h-3 w-3" />RESOLVED</span>}
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{action.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{departments.find((d) => d.id === action.departmentId)?.name} · Due {action.dueDate}</p>

                      {/* Resolved Info */}
                      {resolved && record && (
                        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            ดำเนินการแก้ไขแล้ว
                          </div>
                          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <div className="flex items-center gap-1"><UserIcon className="h-3 w-3" />ผู้บันทึก: {users.find((u) => u.id === record.userId)?.name}</div>
                            <div>หน่วยงาน: {departments.find((d) => d.id === record.departmentId)?.name}</div>
                            <div>วันที่: {record.resolvedAt}</div>
                          </div>
                          {record.description && <p className="mt-1.5 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">{record.description}</p>}
                          {record.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {record.attachments.map((file) => (
                                <span key={file} className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                  <FileText className="h-3 w-3" />{file}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* History */}
                          <button onClick={() => setExpandedHistory(expandedHistory === action.id ? null : action.id)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100">
                            <History className="h-3 w-3" />
                            ประวัติแก้ไข ({record.logs.length})
                          </button>
                          {expandedHistory === action.id && (
                            <div className="mt-2 space-y-1.5 border-t border-emerald-200 pt-2 dark:border-emerald-800">
                              {record.logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-2 text-[10px] text-emerald-600 dark:text-emerald-400">
                                  <span className="shrink-0 rounded bg-emerald-100 px-1 py-px font-mono dark:bg-emerald-900/40">{log.timestamp}</span>
                                  <span className="font-medium">{users.find((u) => u.id === log.userId)?.name}</span>
                                  <span>{log.detail}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", action.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : action.priority === "high" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" : action.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300")}>
                        {t.priority[action.priority]}
                      </span>
                      {canResolve && !resolved && (
                        <button onClick={(e) => { e.stopPropagation(); openCreateModal(action.id, action.title, action.referenceNo); }} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md dark:bg-emerald-500 dark:hover:bg-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />ดำเนินการแก้ไขแล้ว
                        </button>
                      )}
                      {resolved && record && (
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(action.id); }} className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
                          <Pencil className="h-3 w-3" />แก้ไข
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {sortedActions.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">No actions found</div>}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <button onClick={closeModal} className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {modal.mode === "create" ? "บันทึกการแก้ไข" : "แก้ไขข้อมูลการแก้ไข"}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{modal.referenceNo}</h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{modal.actionTitle}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">วันที่ดำเนินการ</label>
                  <input type="date" value={resolveDate} onChange={(e) => setResolveDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">เวลา</label>
                  <input type="time" value={resolveTime} onChange={(e) => setResolveTime(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">ผู้บันทึก</label>
                <select value={resolveUserId} onChange={(e) => { setResolveUserId(e.target.value); const u = users.find((u) => u.id === e.target.value); if (u) setResolveDept(u.departmentId); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({departments.find((d) => d.id === u.departmentId)?.name})</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">หน่วยงานที่ดำเนินการ</label>
                <select value={resolveDept} onChange={(e) => setResolveDept(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">รายละเอียดการแก้ไข</label>
                <textarea value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} rows={3} placeholder="อธิบายว่าได้ดำเนินการแก้ไขอย่างไร..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">แนบเอกสาร (ถ้ามี)</label>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAttach} />
                <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/30">
                  <Paperclip className="h-3.5 w-3.5" />เลือกไฟล์
                </button>
                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {attachments.map((file) => (
                      <span key={file} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <FileText className="h-3 w-3" />{file}
                        <button onClick={() => removeAttachment(file)} className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-500 dark:hover:bg-slate-700"><Trash2 className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={closeModal} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">ยกเลิก</button>
              <button onClick={confirmResolve} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md dark:bg-emerald-500 dark:hover:bg-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {modal.mode === "create" ? "บันทึกการแก้ไข" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
