import { getSession } from "@/lib/auth";
import { getAccountPath } from "@/lib/auth-routes";
import { redirect } from "next/navigation";

export async function requireAuth(role?: "ADMIN" | "B_USER") {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (role && session.user.role !== role) {
    redirect(getAccountPath(session.user.role as "ADMIN" | "B_USER"));
  }
  return session;
}
