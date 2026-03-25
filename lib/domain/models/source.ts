import type { SourceApprovalStatus, SourceStatus } from "@/lib/domain/enums/status";
import type { ActorRef, AuditFields, ID, ISODateString, JurisdictionCode } from "@/lib/domain/types/common";

export interface SourceRecord extends AuditFields {
  id: ID;
  name: string;
  url: string;
  sourceType: "web";
  parserType: "html" | "rss" | "sitemap" | "manual";
  refreshFrequency: "daily" | "weekly" | "manual";
  priority: 1 | 2 | 3 | 4 | 5;
  owner: ActorRef;
  jurisdiction: JurisdictionCode;
  status: SourceStatus;
  approvalStatus: SourceApprovalStatus;
  allowlisted: boolean;
  digestEnabled: boolean;
  changeSeverity: "none" | "minor" | "major";
  lastContentHash?: string;
  lastCheckedAt?: ISODateString;
  nextCheckAt?: ISODateString;
  notes: string;
}

export interface UpsertSourceRequest {
  id?: ID;
  name: string;
  url: string;
  sourceType?: "web";
  parserType?: "html" | "rss" | "sitemap" | "manual";
  refreshFrequency?: "daily" | "weekly" | "manual";
  priority?: 1 | 2 | 3 | 4 | 5;
  digestEnabled: boolean;
  status: SourceStatus;
  approvalStatus?: SourceApprovalStatus;
  allowlisted?: boolean;
  notes: string;
}
