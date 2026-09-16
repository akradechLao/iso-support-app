import { Audit } from "@/types";

export const audits: Audit[] = [
  { id: "AUD-001", title: "ISO 9001 Internal Audit - Q1", standardId: "9001", departmentId: "QA", auditorId: "U001", plannedDate: "15/1/69", completedDate: "15/1/69", status: "closed", findingCount: 3, scope: "Full QMS audit" },
  { id: "AUD-002", title: "ISO 9001 Internal Audit - RD", standardId: "9001", departmentId: "RD", auditorId: "U015", plannedDate: "10/3/69", completedDate: "10/3/69", status: "closed", findingCount: 2, scope: "Research & Development processes" },
  { id: "AUD-003", title: "ISO 9001 Internal Audit - LAB", standardId: "9001", departmentId: "LAB", auditorId: "U015", plannedDate: "20/3/69", completedDate: "20/3/69", status: "closed", findingCount: 2, scope: "Laboratory operations" },
  { id: "AUD-004", title: "ISO 9001 Internal Audit - PUR", standardId: "9001", departmentId: "PUR", auditorId: "U001", plannedDate: "28/3/69", completedDate: "28/3/69", status: "closed", findingCount: 2, scope: "Purchasing & supplier management" },
  { id: "AUD-005", title: "ISO 9001 Internal Audit - HR", standardId: "9001", departmentId: "HR", auditorId: "U015", plannedDate: "1/4/69", completedDate: "1/4/69", status: "closed", findingCount: 1, scope: "Training & competency" },
  { id: "AUD-006", title: "ISO 45001 Internal Audit - SAF", standardId: "45001", departmentId: "SAF", auditorId: "U003", plannedDate: "25/3/69", completedDate: "25/3/69", status: "closed", findingCount: 4, scope: "Occupational health & safety" },
  { id: "AUD-007", title: "ISO 45001 Internal Audit - PROD", standardId: "45001", departmentId: "PROD", auditorId: "U003", plannedDate: "15/4/69", completedDate: "15/4/69", status: "closed", findingCount: 3, scope: "Production safety" },
  { id: "AUD-008", title: "ISO 14001 Internal Audit - TEC", standardId: "14001", departmentId: "TEC", auditorId: "U005", plannedDate: "20/4/69", completedDate: "20/4/69", status: "closed", findingCount: 1, scope: "Environmental aspects" },
  { id: "AUD-009", title: "ISO 14001 Internal Audit - ETEC", standardId: "14001", departmentId: "ETEC", auditorId: "U005", plannedDate: "5/5/69", completedDate: "5/5/69", status: "closed", findingCount: 1, scope: "Electrical environmental impact" },
  { id: "AUD-010", title: "ISO 9001 Internal Audit - MK", standardId: "9001", departmentId: "MK", auditorId: "U001", plannedDate: "28/5/69", completedDate: "28/5/69", status: "closed", findingCount: 1, scope: "Customer relationship management" },
  { id: "AUD-011", title: "ISO 9001 Internal Audit - OFF", standardId: "9001", departmentId: "OFF", auditorId: "U015", plannedDate: "15/4/69", completedDate: "15/4/69", status: "closed", findingCount: 1, scope: "Management review records" },
  { id: "AUD-012", title: "ISO 9001 Internal Audit - Q2", standardId: "9001", departmentId: "QA", auditorId: "U001", plannedDate: "15/6/69", status: "planned", findingCount: 0, scope: "Full QMS audit - Q2" },
  { id: "AUD-013", title: "ISO 45001 Internal Audit - Q2", standardId: "45001", departmentId: "SAF", auditorId: "U003", plannedDate: "20/6/69", status: "planned", findingCount: 0, scope: "OHS audit - Q2" },
  { id: "AUD-014", title: "ISO 9001 Internal Audit - Production Line B", standardId: "9001", departmentId: "PROD", auditorId: "U001", plannedDate: "20/9/2568", status: "in_progress", findingCount: 2, scope: "Production line B quality controls" },
  { id: "AUD-015", title: "ISO 14001 Internal Audit - Q3", standardId: "14001", departmentId: "TEC", auditorId: "U005", plannedDate: "15/9/69", status: "planned", findingCount: 0, scope: "EMS audit - Q3" },
  { id: "AUD-016", title: "ISO 45001 Internal Audit - LAB", standardId: "45001", departmentId: "LAB", auditorId: "U003", plannedDate: "25/8/69", status: "planned", findingCount: 0, scope: "Laboratory OHS audit" },
];
