"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { linkBookingsToUser } from "@/lib/consultation-credit";
import { getServerDictionary } from "@/lib/i18n/server";

export type AuthActionResult =
  | { error: string }
  | { success: true; redirectTo: string }
  | null;

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().optional(),
  phone: z.string().optional(),
  packageId: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val : undefined)),
});

export async function registerUser(formData: FormData): Promise<AuthActionResult> {
  const { t } = await getServerDictionary();
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    company: formData.get("company") || undefined,
    phone: formData.get("phone") || undefined,
    packageId: formData.get("packageId")?.toString(),
  });

  if (!parsed.success) {
    return { error: t.auth.errors.registerInvalid };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: t.auth.errors.emailExists };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      company: parsed.data.company,
      phone: parsed.data.phone,
      role: "B_USER",
      activePackageId: parsed.data.packageId ?? null,
    },
  });

  try {
    await linkBookingsToUser(user.id, parsed.data.email);
  } catch {
    // Non-fatal — account is created; credit sync can happen on next login.
  }

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    if (result?.error) {
      return {
        error: t.auth.errors.signInFailed,
      };
    }
    return { success: true, redirectTo: "/dashboard" };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: t.auth.errors.signInFailed,
      };
    }
    throw error;
  }
}

export async function loginUser(formData: FormData): Promise<AuthActionResult> {
  const { t } = await getServerDictionary();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: t.auth.errors.credentialsRequired };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: t.auth.errors.invalidCredentials };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: t.auth.errors.invalidCredentials };
  }

  try {
    await linkBookingsToUser(user.id, email);
  } catch {
    // Non-fatal — proceed with sign-in.
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      return { error: t.auth.errors.invalidCredentials };
    }
    return {
      success: true,
      redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t.auth.errors.invalidCredentials };
    }
    throw error;
  }
}
