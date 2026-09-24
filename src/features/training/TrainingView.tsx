"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { trainingRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { users } from "@/data/mock/users";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/i18n/I18nContext";
import { Training, Status } from "@/types";
import { GraduationCap, Users, BookOpen, TrendingUp, Plus, Download, CheckCircle, Pencil } from "lucide-react";
import { downloadCsv } from "@/lib/export";
import { thaiDateToIso, isoToThaiDate } from "@/lib/dateStamp";
import FilterBar from "@/components/ui/FilterBar";

const statBox = "rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm transition hover:shadow-md";
const statIcon = "grid h-9 w-9 place-items-center rounded-lg shrink-0";
const statLabel = "text-[11px] font-medium text-slate-500 dark:text-slate-400";
const statValue = "text-lg font-bold text-slate-900 dark:text-white";

export default function TrainingView() {
  const { t } = useI18n();
  const router = useRouter();
  const { filters, setFilters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({
    title: "",
    departmentId: "QA",
    trainerId: "U001",
    date: "",
    status: "planned" as Status,
    attendees: 0,
    competencyRequired: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const trainings = useMemo(() => trainingRepo.findAll(filters), [filters, version]);
  const kpis = useMemo(() => trainingRepo.getKpis(filters), [filters, version]);

  const columns: Column<Training>[] = [
    { key: "id", header: t.training.id, sortable: true },
    { key: "title", header: t.training.title, sortable: true },
    {
      key: "departmentId",
      header: t.training.department,
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    {
      key: "trainerId",
      header: t.training.trainer,
      render: (item) => users.find((u) => u.id === item.trainerId)?.name || item.trainerId,
    },
    { key: "date", header: t.training.date, sortable: true },
    {
      key: "status",
      header: t.training.status,
      render: (item) => <StatusBadge status={item.status} />,
    },
    { key: "attendees", header: t.training.attendees, sortable: true },
    {
      key: "competencyRequired",
      header: t.training.competency,
      render: (item) =>
        item.competencyRequired ? (
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">YES</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEdit(item);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
        >
          <Pencil className="h-3 w-3" />
          {t.common.edit}
        </button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  const openAdd = () => {
    setEditId(null);
    setForm({
      title: "",
      departmentId: "QA",
      trainerId: "U001",
      date: "",
      status: "planned",
      attendees: 0,
      competencyRequired: true,
    });
    setShowModal(true);
  };

  const openEdit = (item: Training) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      departmentId: item.departmentId,
      trainerId: item.trainerId,
      date: thaiDateToIso(item.date) || item.date,
      status: item.status,
      attendees: item.attendees,
      competencyRequired: item.competencyRequired,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      departmentId: form.departmentId,
      trainerId: form.trainerId,
      date: form.date ? isoToThaiDate(form.date) : "-",
      status: form.status,
      attendees: Number(form.attendees) || 0,
      competencyRequired: form.competencyRequired,
    };
    if (editId) {
      trainingRepo.update(editId, payload);
    } else {
      trainingRepo.create(payload);
    }
    setShowModal(false);
    setVersion((v) => v + 1);
  };

  const total = kpis.total;
  const completed = kpis.completed;
  const planned = kpis.planned;
  const inProgress = kpis.inProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-5">
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition">
          &larr; กลับไป Dashboard
        </Link>

        {/* Section Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 shadow-lg">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                ฝึกอบรม — Training &amp; Competency
              </h1>
              <p className="relative mt-1 text-xs text-blue-100">{t.training.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv(
                    "training",
                    ["ID", "Title", "Department", "Trainer", "Date", "Status", "Attendees", "Competency"],
                    trainings.map((tr) => [tr.id, tr.title, tr.departmentId, tr.trainerId, tr.date, tr.status, tr.attendees, tr.competencyRequired ? "YES" : "NO"])
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 backdrop-blur transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {t.common.export}
              </button>
              <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                {t.training.addTraining}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
        </div>

        {/* Stat Boxes */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className={`${statBox} border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40`}>
            <div className={`${statIcon} bg-blue-100 dark:bg-blue-900/50`}>
              <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={statLabel}>{t.training.total}</p>
              <p className={statValue}>{total}</p>
            </div>
          </div>

          <div className={`${statBox} border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40`}>
            <div className={`${statIcon} bg-emerald-100 dark:bg-emerald-900/50`}>
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className={statLabel}>{t.training.completed}</p>
              <p className={statValue}>{completed}</p>
            </div>
          </div>

          <div className={`${statBox} border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40`}>
            <div className={`${statIcon} bg-amber-100 dark:bg-amber-900/50`}>
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className={statLabel}>{t.training.planned}</p>
              <p className={statValue}>{planned}</p>
            </div>
          </div>

          <div className={`${statBox} border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40`}>
            <div className={`${statIcon} bg-violet-100 dark:bg-violet-900/50`}>
              <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className={statLabel}>{t.training.inProgress}</p>
              <p className={statValue}>{inProgress}</p>
            </div>
          </div>
        </div>

        {/* Training Register Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.training.register}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.training.registerSub}</p>
          </div>
          <div className="p-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={trainings as unknown as Record<string, unknown>[]}
              onRowClick={(item) => openEdit(item as unknown as Training)}
              searchable
              searchPlaceholder={t.training.search}
            />
          </div>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? t.training.editTraining : t.training.newTrainingTitle} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.training.title} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.training.department}</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.training.trainer}</label>
              <select
                value={form.trainerId}
                onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.training.date}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.training.status}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="planned">{t.status.planned}</option>
                <option value="in_progress">{t.status.in_progress}</option>
                <option value="closed">{t.status.closed}</option>
                <option value="overdue">{t.status.overdue}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.training.attendees}</label>
              <input
                type="number"
                min={0}
                value={form.attendees}
                onChange={(e) => setForm({ ...form, attendees: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.competencyRequired}
              onChange={(e) => setForm({ ...form, competencyRequired: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            {t.training.competencyRequired}
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <CheckCircle className="h-4 w-4" />
            {t.common.save}
          </button>
        </div>
      </Modal>
    </div>
  );
}
