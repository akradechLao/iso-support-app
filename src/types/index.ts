export type Status =
  | "draft"
  | "pending"
  | "in_progress"
  | "due_soon"
  | "overdue"
  | "verified"
  | "closed"
  | "compliant"
  | "non_compliant"
  | "published"
  | "revision_due"
  | "obsolete"
  | "planned"
  | "finding_recorded"
  | "reported"
  | "follow_up"
  | "root_cause"
  | "action_planned"
  | "action_in_progress"
  | "applicable"
  | "pending_assessment"
  | "action_required"
  | "open";

export type Priority = "low" | "medium" | "high" | "critical";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: "admin" | "manager" | "auditor" | "owner" | "viewer";
}

export interface Department {
  id: string;
  name: string;
  nameTh: string;
}

export interface ISOStandard {
  id: string;
  code: string;
  name: string;
}

export interface ISOClause {
  id: string;
  standardId: string;
  code: string;
  title: string;
  parentId?: string;
}

export interface DocumentRecord {
  id: string;
  code: string;
  title: string;
  type: string;
  departmentId: string;
  revision: string;
  status: Status;
  ownerId: string;
  reviewDate: string;
  approvalStatus: Status;
  clauseIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Audit {
  id: string;
  title: string;
  standardId: string;
  departmentId: string;
  auditorId: string;
  plannedDate: string;
  completedDate?: string;
  status: Status;
  findingCount: number;
  scope: string;
}

export interface Finding {
  id: string;
  auditId: string;
  clauseId?: string;
  departmentId: string;
  severity: Priority;
  title: string;
  description: string;
  rootCause?: string;
  status: Status;
  ownerId: string;
  dueDate: string;
}

export interface CorrectiveAction {
  id: string;
  findingId?: string;
  referenceNo: string;
  title: string;
  description: string;
  ownerId: string;
  departmentId: string;
  dueDate: string;
  status: Status;
  priority: Priority;
  source: string;
  evidence?: string[];
  verification?: string;
  closedAt?: string;
  createdAt: string;
}

export interface LegalRequirement {
  id: string;
  law: string;
  type: string;
  publicationDate?: string;
  effectiveDate?: string;
  departmentId: string;
  status: Status;
  assessmentDate?: string;
  actionId?: string;
  description: string;
}

export interface Risk {
  id: string;
  title: string;
  departmentId: string;
  likelihood: number;
  impact: number;
  inherentScore: number;
  residualScore: number;
  ownerId: string;
  status: Status;
  description: string;
}

export interface Training {
  id: string;
  title: string;
  departmentId: string;
  trainerId: string;
  date: string;
  status: Status;
  attendees: number;
  competencyRequired: boolean;
}

export interface KPI {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "good" | "warning" | "danger";
  href?: string;
}

export interface FilterState {
  standard: string;
  department: string;
  status: string;
  period: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ActivityLog {
  id: string;
  type: "approval" | "audit" | "finding" | "action" | "verification" | "closure";
  title: string;
  description: string;
  userId: string;
  timestamp: string;
  relatedId?: string;
}
