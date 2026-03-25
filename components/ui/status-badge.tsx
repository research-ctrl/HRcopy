import { Badge } from "@/components/ui/badge";

type StatusValue =
  | "uploaded"
  | "stored"
  | "extracting"
  | "extracted"
  | "indexed"
  | "ready"
  | "approved"
  | "rejected"
  | "pending"
  | "needs-review"
  | "failed"
  | "active"
  | "inactive"
  | "draft"
  | "completed"
  | "running"
  | "queued"
  | "pass"
  | "review"
  | "fail";

export function StatusBadge({ value }: { value: StatusValue | string }) {
  const tone =
    value === "approved" || value === "active" || value === "completed" || value === "pass"
      ? "success"
      : value === "failed" || value === "rejected" || value === "fail"
        ? "danger"
        : value === "pending" || value === "needs-review" || value === "review" || value === "draft"
          ? "warning"
          : "info";

  return <Badge tone={tone}>{String(value).replace(/-/g, " ")}</Badge>;
}

