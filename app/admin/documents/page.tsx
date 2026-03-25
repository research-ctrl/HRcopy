import { redirect } from "next/navigation";

/** /admin/documents has moved to /admin/knowledge */
export default function DocumentsRedirect() {
  redirect("/admin/knowledge");
}
