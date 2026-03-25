export type ID = string;
export type ISODateString = string;

export type JurisdictionCode = "PT" | "EU";

export type ProviderFamily = "nvidia" | "mistral" | "compatible";
export type HealthState = "healthy" | "degraded" | "offline";

export interface AuditFields {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ActorRef {
  id: ID;
  name: string;
  role: "hr-admin" | "legal-reviewer" | "ops-owner";
}

