import { Risk, FilterState } from "@/types";
import { risks } from "../mock/risks";
import { RiskRepository } from "./riskRepository";

export class MockRiskRepository implements RiskRepository {
  findAll(filters?: FilterState): Risk[] {
    let result = [...risks];

    if (filters?.department && filters.department !== "all") {
      result = result.filter((r) => r.departmentId === filters.department);
    }

    if (filters?.status && filters.status !== "all") {
      result = result.filter((r) => r.status === filters.status);
    }

    return result;
  }

  findById(id: string): Risk | null {
    return risks.find((r) => r.id === id) || null;
  }

  getHeatmapData(filters?: FilterState): number[][] {
    const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    this.findAll(filters).forEach((r) => {
      const lIdx = Math.min(r.likelihood - 1, 4);
      const iIdx = Math.min(r.impact - 1, 4);
      grid[lIdx][iIdx]++;
    });
    return grid;
  }

  getKpis(filters?: FilterState) {
    const all = this.findAll(filters);
    const high = all.filter((r) => r.residualScore >= 10);
    const medium = all.filter((r) => r.residualScore >= 5 && r.residualScore < 10);
    const low = all.filter((r) => r.residualScore < 5);

    return {
      total: all.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
    };
  }
}
