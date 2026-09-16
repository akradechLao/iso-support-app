import { Risk } from "@/types";

export const risks: Risk[] = [
  { id: "RSK-001", title: "Non-compliance with ISO 9001 requirements", departmentId: "QA", likelihood: 3, impact: 4, inherentScore: 12, residualScore: 8, ownerId: "U001", status: "in_progress", description: "Risk of failing ISO 9001 certification audit due to incomplete documentation" },
  { id: "RSK-002", title: "Chemical storage incident", departmentId: "SAF", likelihood: 2, impact: 5, inherentScore: 10, residualScore: 6, ownerId: "U003", status: "in_progress", description: "Risk of chemical spill or fire in storage area" },
  { id: "RSK-003", title: "Equipment calibration failure", departmentId: "LAB", likelihood: 3, impact: 3, inherentScore: 9, residualScore: 5, ownerId: "U006", status: "open", description: "Testing equipment giving inaccurate results" },
  { id: "RSK-004", title: "Customer complaint escalation", departmentId: "MK", likelihood: 3, impact: 3, inherentScore: 9, residualScore: 6, ownerId: "U013", status: "open", description: "Unresolved customer complaints leading to business loss" },
  { id: "RSK-005", title: "Electrical safety hazard", departmentId: "ETEC", likelihood: 2, impact: 5, inherentScore: 10, residualScore: 4, ownerId: "U014", status: "in_progress", description: "Risk of electrical accident due to overdue inspection" },
  { id: "RSK-006", title: "Environmental contamination", departmentId: "TEC", likelihood: 2, impact: 4, inherentScore: 8, residualScore: 4, ownerId: "U005", status: "open", description: "Risk of environmental contamination from operations" },
  { id: "RSK-007", title: "Supplier quality failure", departmentId: "PUR", likelihood: 3, impact: 3, inherentScore: 9, residualScore: 6, ownerId: "U011", status: "open", description: "Substandard materials from suppliers affecting product quality" },
  { id: "RSK-008", title: "Employee injury in production", departmentId: "PROD", likelihood: 2, impact: 4, inherentScore: 8, residualScore: 4, ownerId: "U007", status: "open", description: "Risk of workplace injury in production area" },
  { id: "RSK-009", title: "Data loss / IT system failure", departmentId: "IT", likelihood: 2, impact: 3, inherentScore: 6, residualScore: 3, ownerId: "U012", status: "open", description: "Risk of data loss or system downtime" },
  { id: "RSK-010", title: "Legal compliance gap", departmentId: "LAW", likelihood: 2, impact: 4, inherentScore: 8, residualScore: 5, ownerId: "U009", status: "open", description: "Risk of non-compliance with new legal requirements" },
  { id: "RSK-011", title: "Training competency gap", departmentId: "HR", likelihood: 3, impact: 2, inherentScore: 6, residualScore: 3, ownerId: "U002", status: "open", description: "Staff lacking required competencies for their roles" },
  { id: "RSK-012", title: "Emergency response delay", departmentId: "SAF", likelihood: 2, impact: 5, inherentScore: 10, residualScore: 6, ownerId: "U003", status: "open", description: "Delayed response to emergency situations" },
  { id: "RSK-013", title: "Quality objective misalignment", departmentId: "RD", likelihood: 3, impact: 2, inherentScore: 6, residualScore: 3, ownerId: "U004", status: "open", description: "Quality objectives not aligned with organizational goals" },
  { id: "RSK-014", title: "Document control failure", departmentId: "QA", likelihood: 2, impact: 3, inherentScore: 6, residualScore: 3, ownerId: "U001", status: "open", description: "Outdated documents in circulation" },
  { id: "RSK-015", title: "Waste disposal non-compliance", departmentId: "PUR", likelihood: 3, impact: 3, inherentScore: 9, residualScore: 5, ownerId: "U011", status: "in_progress", description: "Improper waste disposal procedures" },
  { id: "RSK-016", title: "Management review gaps", departmentId: "OFF", likelihood: 2, impact: 2, inherentScore: 4, residualScore: 2, ownerId: "U008", status: "open", description: "Incomplete management review documentation" },
];
