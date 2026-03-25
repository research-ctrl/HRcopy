import { redirect } from "next/navigation";

/** /admin/runs has moved to /admin/sync */
export default function RunsRedirect() {
  redirect("/admin/sync");
}
