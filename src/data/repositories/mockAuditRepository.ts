import { Audit, FilterState } from "@/types";
import { audits } from "../mock/audits";
import { AuditRepository } from "./auditRepository";

export class MockAuditRepository implements AuditRepository {
  findAll(filters?: FilterState): Audit[] {
    let result = [...audits];

    if (filters?.standard && filters.standard !== "all") {
      result = result.filter((a) => a.standardId === filters.standard);
    }

    if (filters?.department && filters.department !== "all") {
      result = result.filter((a) => a.departmentId === filters.department);
    }

    if (filters?.status && filters.status !== "all") {
      result = result.filter((a) => a.status === filters.status);
    }

    return result;
  }

  findById(id: string): Audit | null {
    return audits.find((a) => a.id === id) || null;
  }

  findByStandard(standardId: string): Audit[] {
    return audits.filter((a) => a.standardId === standardId);
  }

  getKpis(filters?: FilterState) {
    const all = this.findAll(filters);
    const completed = all.filter((a) => a.status === "closed");
    const planned = all.filter((a) => a.status === "planned");
    const inProgress = all.filter((a) => a.status === "in_progress");
    const completionRate = all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0;

    return {
      total: all.length,
      completed: completed.length,
      planned: planned.length,
      inProgress: inProgress.length,
      completionRate,
    };
  }
}
