import { LegalRequirement, FilterState } from "@/types";

export type CreateLegalRequirementInput = Omit<LegalRequirement, "id">;

export interface LegalRepository {
  findAll(filters?: FilterState): LegalRequirement[];
  findById(id: string): LegalRequirement | null;
  create(input: CreateLegalRequirementInput): LegalRequirement;
  update(id: string, patch: Partial<LegalRequirement>): LegalRequirement | null;
  getKpis(filters?: FilterState): {
    total: number;
    comply: number;
    nonComply: number;
    pending: number;
    complianceRate: number;
  };
}
