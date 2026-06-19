"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().optional(),
  phone: z.string().optional(),
  packageId: z.string().optional(),
});

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    company: formData.get("company") || undefined,
    phone: formData.get("phone") || undefined,
    packageId: formData.get("packageId") || undefined,
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

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      company: parsed.data.company,
      phone: parsed.data.phone,
      role: "B_USER",
      activePackageId: parsed.data.packageId,
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    // signIn may throw on redirect
  }

  return { success: true };
}

export async function loginUser(formData: FormData) {
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
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true, role: user.role };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
