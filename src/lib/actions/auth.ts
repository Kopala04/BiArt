"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { linkBookingsToUser } from "@/lib/consultation-credit";

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
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    company: formData.get("company") || undefined,
    phone: formData.get("phone") || undefined,
    packageId: formData.get("packageId")?.toString(),
  });

  if (!parsed.success) {
    return { error: "Please fill in all required fields correctly." };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
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
        error: "Account created but sign-in failed. Please log in manually.",
      };
    }
    return { success: true, redirectTo: "/dashboard" };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Account created but sign-in failed. Please log in manually.",
      };
    }
    throw error;
  }
}

export async function loginUser(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
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
      return { error: "Invalid email or password." };
    }
    return {
      success: true,
      redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
