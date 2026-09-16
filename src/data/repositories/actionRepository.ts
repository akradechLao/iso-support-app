import { CorrectiveAction, FilterState } from "@/types";

export interface ActionRepository {
  findAll(filters?: FilterState): CorrectiveAction[];
  findById(id: string): CorrectiveAction | null;
  findOverdue(): CorrectiveAction[];
  findByDepartment(deptId: string): CorrectiveAction[];
  getKpis(filters?: FilterState): {
    total: number;
    open: number;
    overdue: number;
    closed: number;
    critical: number;
    pendingVerification: number;
  };
}
