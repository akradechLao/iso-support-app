import { DocumentRecord, FilterState } from "@/types";

export interface DocumentRepository {
  findAll(filters?: FilterState): DocumentRecord[];
  findById(id: string): DocumentRecord | null;
  findByDepartment(deptId: string): DocumentRecord[];
  getKpis(filters?: FilterState): {
    total: number;
    active: number;
    dueReview: number;
    pendingApproval: number;
    overdueReview: number;
    obsolete: number;
  };
}
