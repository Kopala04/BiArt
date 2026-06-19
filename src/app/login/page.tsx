"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { loginUser } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      return loginUser(formData);
    },
    null
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-bold">Client Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Access your dashboard to view bookings and package details.
          </p>

          <form action={action} className="mt-8 space-y-5">
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </p>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-amber-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
