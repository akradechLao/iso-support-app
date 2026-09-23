import { CorrectiveAction, FilterState } from "@/types";
import { actions } from "../mock/actions";
import { CreateActionInput, ActionRepository } from "./actionRepository";
import { isOverdue } from "@/lib/date";
import { todayStamp } from "@/lib/dateStamp";

function nextId(): string {
  const max = actions.reduce((acc, a) => {
    const n = parseInt(a.id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `CAR-${String(max + 1).padStart(3, "0")}`;
}

function nextRef(id: string): string {
  const n = parseInt(id.replace(/\D/g, ""), 10) || 1;
  const year = (new Date().getFullYear() + 543) % 100;
  return `Q-IQA-${String(n).padStart(3, "0")}/${String(year).padStart(2, "0")}`;
}

export class MockActionRepository implements ActionRepository {
  findAll(filters?: FilterState): CorrectiveAction[] {
    let result = [...actions];

    if (filters?.standard && filters.standard !== "all") {
      result = result;
    }

    if (filters?.department && filters.department !== "all") {
      result = result.filter((a) => a.departmentId === filters.department);
    }

    if (filters?.status && filters.status !== "all") {
      if (filters.status === "open") {
        result = result.filter((a) => a.status !== "closed" && a.status !== "verified");
      } else if (filters.status === "closed") {
        result = result.filter((a) => a.status === "closed" || a.status === "verified");
      } else if (filters.status === "overdue") {
        result = result.filter((a) => isOverdue(a.dueDate, a.status));
      } else {
        result = result.filter((a) => a.status === filters.status);
      }
    }

    return result;
  }

  findById(id: string): CorrectiveAction | null {
    return actions.find((a) => a.id === id) || null;
  }

  findOverdue(): CorrectiveAction[] {
    return actions.filter((a) => isOverdue(a.dueDate, a.status));
  }

  findByDepartment(deptId: string): CorrectiveAction[] {
    return actions.filter((a) => a.departmentId === deptId);
  }

  create(input: CreateActionInput): CorrectiveAction {
    const id = nextId();
    const record: CorrectiveAction = {
      ...input,
      id,
      findingId: input.findingId,
      referenceNo: nextRef(id),
      createdAt: todayStamp(),
    };
    actions.push(record);
    return record;
  }

  update(id: string, patch: Partial<CorrectiveAction>): CorrectiveAction | null {
    const idx = actions.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    actions[idx] = { ...actions[idx], ...patch, id };
    return actions[idx];
  }

  getKpis(filters?: FilterState) {
    const all = this.findAll(filters);
    const overdue = all.filter((a) => isOverdue(a.dueDate, a.status));
    const open = all.filter((a) => a.status !== "closed" && a.status !== "verified");
    const closed = all.filter((a) => a.status === "closed" || a.status === "verified");
    const critical = open.filter((a) => a.priority === "critical");
    const pendingVerification = all.filter((a) => a.status === "action_in_progress" || a.status === "follow_up");

    return {
      total: all.length,
      open: open.length,
      overdue: overdue.length,
      closed: closed.length,
      critical: critical.length,
      pendingVerification: pendingVerification.length,
    };
  }
}
