import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Oturum yoksa /login'e yönlendirir. */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Belirtilen rollerden biri değilse ana sayfaya yönlendirir. */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export function isStaff(role: Role) {
  return role === "ADMIN" || role === "COUNSELOR";
}
