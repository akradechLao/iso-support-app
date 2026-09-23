import { CorrectiveAction, FilterState } from "@/types";

export type CreateActionInput = Omit<
  CorrectiveAction,
  "id" | "referenceNo" | "createdAt" | "findingId"
> & {
  findingId?: string;
};

export interface ActionRepository {
  findAll(filters?: FilterState): CorrectiveAction[];
  findById(id: string): CorrectiveAction | null;
  findOverdue(): CorrectiveAction[];
  findByDepartment(deptId: string): CorrectiveAction[];
  create(input: CreateActionInput): CorrectiveAction;
  update(id: string, patch: Partial<CorrectiveAction>): CorrectiveAction | null;
  getKpis(filters?: FilterState): {
    total: number;
    open: number;
    overdue: number;
    closed: number;
    critical: number;
    pendingVerification: number;
  };
}
