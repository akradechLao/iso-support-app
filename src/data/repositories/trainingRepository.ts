import { Training, FilterState } from "@/types";

export type CreateTrainingInput = Omit<Training, "id">;

export interface TrainingRepository {
  findAll(filters?: FilterState): Training[];
  findById(id: string): Training | null;
  create(input: CreateTrainingInput): Training;
  update(id: string, patch: Partial<Training>): Training | null;
  getKpis(filters?: FilterState): {
    total: number;
    completed: number;
    planned: number;
    inProgress: number;
    overdue: number;
  };
}
