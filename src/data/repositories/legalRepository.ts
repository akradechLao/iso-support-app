import { LegalRequirement, FilterState } from "@/types";

export interface LegalRepository {
  findAll(filters?: FilterState): LegalRequirement[];
  findById(id: string): LegalRequirement | null;
  getKpis(filters?: FilterState): {
    total: number;
    comply: number;
    nonComply: number;
    pending: number;
    complianceRate: number;
  };
}
