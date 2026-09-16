import { DocumentRecord, FilterState } from "@/types";
import { documents } from "../mock/documents";
import { DocumentRepository } from "./documentRepository";
import { isOverdue } from "@/lib/date";

export class MockDocumentRepository implements DocumentRepository {
  findAll(filters?: FilterState): DocumentRecord[] {
    let result = [...documents];

    if (filters?.department && filters.department !== "all") {
      result = result.filter((d) => d.departmentId === filters.department);
    }

    if (filters?.status && filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    return result;
  }

  findById(id: string): DocumentRecord | null {
    return documents.find((d) => d.id === id) || null;
  }

  findByDepartment(deptId: string): DocumentRecord[] {
    return documents.filter((d) => d.departmentId === deptId);
  }

  getKpis(filters?: FilterState) {
    const all = this.findAll(filters);
    const active = all.filter((d) => d.status === "published");
    const dueReview = all.filter((d) => d.status === "revision_due");
    const pendingApproval = all.filter((d) => d.approvalStatus === "pending");
    const overdueReview = all.filter((d) => isOverdue(d.reviewDate, d.status));
    const obsolete = all.filter((d) => d.status === "obsolete");

    return {
      total: all.length,
      active: active.length,
      dueReview: dueReview.length,
      pendingApproval: pendingApproval.length,
      overdueReview: overdueReview.length,
      obsolete: obsolete.length,
    };
  }
}
