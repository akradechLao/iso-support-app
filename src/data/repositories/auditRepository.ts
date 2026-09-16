import { Audit, FilterState } from "@/types";

export interface AuditRepository {
  findAll(filters?: FilterState): Audit[];
  findById(id: string): Audit | null;
  findByStandard(standardId: string): Audit[];
  getKpis(filters?: FilterState): {
    total: number;
    completed: number;
    planned: number;
    inProgress: number;
    completionRate: number;
  };
}
