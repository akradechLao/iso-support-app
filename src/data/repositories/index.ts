import { ActionRepository } from "./actionRepository";
import { DocumentRepository } from "./documentRepository";
import { AuditRepository } from "./auditRepository";
import { LegalRepository } from "./legalRepository";
import { RiskRepository } from "./riskRepository";
import { TrainingRepository } from "./trainingRepository";
import { MockActionRepository } from "./mockActionRepository";
import { MockDocumentRepository } from "./mockDocumentRepository";
import { MockAuditRepository } from "./mockAuditRepository";
import { MockLegalRepository } from "./mockLegalRepository";
import { MockRiskRepository } from "./mockRiskRepository";
import { MockTrainingRepository } from "./mockTrainingRepository";

export type { ActionRepository } from "./actionRepository";
export type { DocumentRepository } from "./documentRepository";
export type { AuditRepository } from "./auditRepository";
export type { LegalRepository } from "./legalRepository";
export type { RiskRepository } from "./riskRepository";
export type { TrainingRepository } from "./trainingRepository";

export const actionRepo: ActionRepository = new MockActionRepository();
export const documentRepo: DocumentRepository = new MockDocumentRepository();
export const auditRepo: AuditRepository = new MockAuditRepository();
export const legalRepo: LegalRepository = new MockLegalRepository();
export const riskRepo: RiskRepository = new MockRiskRepository();
export const trainingRepo: TrainingRepository = new MockTrainingRepository();
