import { redirect } from "next/navigation";

/** /admin/reviews has moved to /admin/knowledge */
export default function ReviewsRedirect() {
  redirect("/admin/knowledge");
}
