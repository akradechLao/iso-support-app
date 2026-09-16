import { CorrectiveAction, FilterState } from "@/types";
import { actions } from "../mock/actions";
import { ActionRepository } from "./actionRepository";
import { isOverdue } from "@/lib/date";

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
