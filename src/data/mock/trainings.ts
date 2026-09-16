import { Training } from "@/types";

export const trainings: Training[] = [
  { id: "TRN-001", title: "ISO 9001:2015 Awareness Training", departmentId: "QA", trainerId: "U001", date: "15/1/69", status: "closed", attendees: 25, competencyRequired: true },
  { id: "TRN-002", title: "Safety Induction - New Employees", departmentId: "HR", trainerId: "U003", date: "1/2/69", status: "closed", attendees: 10, competencyRequired: true },
  { id: "TRN-003", title: "Internal Auditor Training", departmentId: "QA", trainerId: "U001", date: "15/2/69", status: "closed", attendees: 8, competencyRequired: true },
  { id: "TRN-004", title: "Chemical Handling Safety", departmentId: "SAF", trainerId: "U003", date: "1/3/69", status: "closed", attendees: 15, competencyRequired: true },
  { id: "TRN-005", title: "ISO 14001 Environmental Awareness", departmentId: "TEC", trainerId: "U005", date: "15/3/69", status: "closed", attendees: 20, competencyRequired: true },
  { id: "TRN-006", title: "Fire Safety & Evacuation Drill", departmentId: "SAF", trainerId: "U003", date: "1/4/69", status: "closed", attendees: 45, competencyRequired: false },
  { id: "TRN-007", title: "Document Control Best Practices", departmentId: "QA", trainerId: "U001", date: "15/4/69", status: "closed", attendees: 12, competencyRequired: false },
  { id: "TRN-008", title: "ISO 45001:2018 Lead Auditor", departmentId: "QA", trainerId: "U015", date: "1/5/69", status: "closed", attendees: 5, competencyRequired: true },
  { id: "TRN-009", title: "Forklift Operator Competency Renewal", departmentId: "PROD", trainerId: "U003", date: "15/5/69", status: "closed", attendees: 6, competencyRequired: true },
  { id: "TRN-010", title: "Risk Assessment Methodology", departmentId: "QA", trainerId: "U001", date: "1/6/69", status: "closed", attendees: 10, competencyRequired: true },
  { id: "TRN-011", title: "Emergency Response Team Training", departmentId: "SAF", trainerId: "U003", date: "15/6/69", status: "closed", attendees: 12, competencyRequired: true },
  { id: "TRN-012", title: "Waste Management Procedures", departmentId: "PUR", trainerId: "U011", date: "1/7/69", status: "in_progress", attendees: 8, competencyRequired: true },
  { id: "TRN-013", title: "Electrical Safety Refresher", departmentId: "ETEC", trainerId: "U014", date: "15/7/69", status: "planned", attendees: 0, competencyRequired: true },
  { id: "TRN-014", title: "PDPA Compliance Training", departmentId: "IT", trainerId: "U012", date: "1/8/69", status: "planned", attendees: 0, competencyRequired: true },
  { id: "TRN-015", title: "Quality Objectives Review Workshop", departmentId: "RD", trainerId: "U004", date: "15/8/69", status: "planned", attendees: 0, competencyRequired: false },
];
