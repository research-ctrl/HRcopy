import { createHash, randomUUID } from "node:crypto";

export function createId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}
