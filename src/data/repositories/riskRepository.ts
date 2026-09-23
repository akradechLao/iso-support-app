import { Risk, FilterState } from "@/types";

export interface RiskRepository {
  findAll(filters?: FilterState): Risk[];
  findById(id: string): Risk | null;
  getHeatmapData(filters?: FilterState): number[][];
  getKpis(filters?: FilterState): {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}
