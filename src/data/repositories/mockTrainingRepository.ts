import { Training, FilterState } from "@/types";
import { trainings } from "../mock/trainings";
import { CreateTrainingInput, TrainingRepository } from "./trainingRepository";

function nextId(): string {
  const max = trainings.reduce((acc, tr) => {
    const n = parseInt(tr.id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `TRN-${String(max + 1).padStart(3, "0")}`;
}

export class MockTrainingRepository implements TrainingRepository {
  findAll(filters?: FilterState): Training[] {
    let result = [...trainings];

    if (filters?.department && filters.department !== "all") {
      result = result.filter((tr) => tr.departmentId === filters.department);
    }

    if (filters?.status && filters.status !== "all") {
      result = result.filter((tr) => tr.status === filters.status);
    }

    return result;
  }

  findById(id: string): Training | null {
    return trainings.find((tr) => tr.id === id) || null;
  }

  create(input: CreateTrainingInput): Training {
    const record: Training = { ...input, id: nextId() };
    trainings.push(record);
    return record;
  }

  update(id: string, patch: Partial<Training>): Training | null {
    const idx = trainings.findIndex((tr) => tr.id === id);
    if (idx < 0) return null;
    trainings[idx] = { ...trainings[idx], ...patch, id };
    return trainings[idx];
  }

  getKpis(filters?: FilterState) {
    const all = this.findAll(filters);
    const completed = all.filter((tr) => tr.status === "closed");
    const planned = all.filter((tr) => tr.status === "planned");
    const inProgress = all.filter(
      (tr) => tr.status === "in_progress" || tr.status === "pending"
    );
    const overdue = all.filter((tr) => tr.status === "overdue");

    return {
      total: all.length,
      completed: completed.length,
      planned: planned.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
    };
  }
}
