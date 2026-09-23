import { LegalRequirement, FilterState } from "@/types";
import { legalRequirements } from "../mock/legal";
import { CreateLegalRequirementInput, LegalRepository } from "./legalRepository";

function nextId(): string {
  const max = legalRequirements.reduce((acc, l) => {
    const n = parseInt(l.id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `LGL-${String(max + 1).padStart(3, "0")}`;
}

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

  create(input: CreateLegalRequirementInput): LegalRequirement {
    const record: LegalRequirement = { ...input, id: nextId() };
    legalRequirements.push(record);
    return record;
  }

  update(id: string, patch: Partial<LegalRequirement>): LegalRequirement | null {
    const idx = legalRequirements.findIndex((l) => l.id === id);
    if (idx < 0) return null;
    legalRequirements[idx] = { ...legalRequirements[idx], ...patch, id };
    return legalRequirements[idx];
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
