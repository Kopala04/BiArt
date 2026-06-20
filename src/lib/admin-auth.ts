import { getSession } from "@/lib/auth";

export async function requireAdminAction() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}
