import { DocumentRecord, FilterState } from "@/types";

export type CreateDocumentInput = Omit<
  DocumentRecord,
  "id" | "createdAt" | "updatedAt" | "clauseIds"
> & {
  clauseIds?: string[];
};

export interface DocumentRepository {
  findAll(filters?: FilterState): DocumentRecord[];
  findById(id: string): DocumentRecord | null;
  findByDepartment(deptId: string): DocumentRecord[];
  create(input: CreateDocumentInput): DocumentRecord;
  getKpis(filters?: FilterState): {
    total: number;
    active: number;
    dueReview: number;
    pendingApproval: number;
    overdueReview: number;
    obsolete: number;
  };
}
