"use server";

import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations";

export type AuthActionState = {
  error?: "invalid" | "exists" | "validation" | "unknown";
} | null;

export async function loginAction(
  locale: string,
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: `/${locale}/dashboard`,
    });
    return null;
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AuthError) return { error: "invalid" };
    return { error: "unknown" };
  }
}

export async function registerAction(
  locale: string,
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "validation" };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "exists" };

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "CLIENT",
      locale: locale === "en" ? "EN" : "TR",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: `/${locale}/dashboard`,
    });
    return null;
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AuthError) return { error: "invalid" };
    return { error: "unknown" };
  }
}
