/** Default authenticated landing path by role (navbar + post-login redirects). */
export function getAccountPath(role: "ADMIN" | "B_USER"): string {
  return role === "ADMIN" ? "/admin" : "/profile";
}
