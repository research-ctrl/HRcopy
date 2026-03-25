export type DocumentLifecycleStatus =
  | "uploaded"
  | "stored"
  | "extracting"
  | "extracted"
  | "indexed"
  | "ready"
  | "approved"
  | "needs-review"
  | "failed";

export type DocumentApprovalStatus = "pending" | "approved" | "rejected";
export type SourceStatus = "active" | "inactive" | "draft";
export type SourceApprovalStatus = "pending" | "approved" | "rejected";
export type MonitoringRunStatus = "queued" | "running" | "completed" | "failed";
export type ReviewVerdict = "approved" | "flagged" | "needs-edits";
export type FeedbackSignal = "helpful" | "not-helpful" | "unsafe";
export type QcStatus = "pass" | "review" | "fail";
