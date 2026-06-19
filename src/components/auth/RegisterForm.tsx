"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { registerUser } from "@/lib/actions/auth";

function RegisterForm({
  packages,
  preselectedPackageId,
}: {
  packages: { id: string; name: string }[];
  preselectedPackageId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = preselectedPackageId || searchParams.get("packageId") || "";

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await registerUser(formData);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
      return result;
    },
    null
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-bold">Create Business Account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Register as a B2B client to access your personal dashboard after
            purchasing a package.
          </p>

          <form action={action} className="mt-8 space-y-5">
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </p>
            )}
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Business Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            {packages.length > 0 && (
              <div>
                <Label htmlFor="packageId">Active Package</Label>
                <select
                  id="packageId"
                  name="packageId"
                  defaultValue={packageId}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Select a package (optional)</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function RegisterPageWrapper({
  packages,
  preselectedPackageId,
}: {
  packages: { id: string; name: string }[];
  preselectedPackageId: string;
}) {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <RegisterForm packages={packages} preselectedPackageId={preselectedPackageId} />
    </Suspense>
  );
}
