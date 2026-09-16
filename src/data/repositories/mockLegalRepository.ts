import { LegalRequirement, FilterState } from "@/types";
import { legalRequirements } from "../mock/legal";
import { LegalRepository } from "./legalRepository";

export class MockLegalRepository implements LegalRepository {
  findAll(filters?: FilterState): LegalRequirement[] {
    let result = [...legalRequirements];

    if (filters?.department && filters.department !== "all") {
      result = result.filter((l) => l.departmentId === filters.department);
    }

    if (filters?.status && filters.status !== "all") {
      result = result.filter((l) => l.status === filters.status);
    }

    return result;
  }

  findById(id: string): LegalRequirement | null {
    return legalRequirements.find((l) => l.id === id) || null;
  }

  getKpis(filters?: FilterState) {
    const all = this.findAll(filters);
    const comply = all.filter((l) => l.status === "compliant");
    const nonComply = all.filter((l) => l.status === "non_compliant");
    const pending = all.filter((l) => l.status === "pending_assessment" || l.status === "pending");
    const complianceRate = all.length > 0 ? Math.round((comply.length / all.length) * 100) : 0;

    return {
      total: all.length,
      comply: comply.length,
      nonComply: nonComply.length,
      pending: pending.length,
      complianceRate,
    };
  }
}
