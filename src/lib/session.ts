import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth(role?: "ADMIN" | "B_USER") {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (role && session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  return session;
}
