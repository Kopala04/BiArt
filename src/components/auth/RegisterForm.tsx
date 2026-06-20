"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { registerUser, type AuthActionResult } from "@/lib/actions/auth";
import { useT } from "@/components/i18n/LanguageProvider";

function RegisterForm({
  packages,
  preselectedPackageId,
}: {
  packages: { id: string; name: string }[];
  preselectedPackageId: string;
}) {
  const t = useT();
  const searchParams = useSearchParams();
  const packageId = preselectedPackageId || searchParams.get("packageId") || "";
  const router = useRouter();

  const [state, action, pending] = useActionState(
    async (_prev: AuthActionResult, formData: FormData) => {
      const result = await registerUser(formData);
      if (result && "success" in result && result.success) {
        router.push(result.redirectTo);
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
          <h1 className="text-2xl font-bold">{t.auth.registerTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.auth.registerSubtitle}</p>

          <form action={action} className="mt-8 space-y-5">
            {state && "error" in state && state.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </p>
            )}
            <div>
              <Label htmlFor="name">{t.auth.fullName} *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">{t.auth.businessEmail} *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">{t.auth.password} *</Label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>
            <div>
              <Label htmlFor="company">{t.auth.companyName}</Label>
              <Input id="company" name="company" />
            </div>
            <div>
              <Label htmlFor="phone">{t.auth.phone}</Label>
              <Input id="phone" name="phone" />
            </div>
            {packages.length > 0 && (
              <div>
                <Label htmlFor="packageId">{t.auth.activePackage}</Label>
                <select
                  id="packageId"
                  name="packageId"
                  defaultValue={packageId}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">{t.auth.selectPackageOptional}</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t.auth.creatingAccount : t.auth.createAccount}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="font-medium text-amber-600 hover:underline">
              {t.auth.signInLink}
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
  const t = useT();
  return (
    <Suspense fallback={<div className="py-24 text-center">{t.common.loading}</div>}>
      <RegisterForm packages={packages} preselectedPackageId={preselectedPackageId} />
    </Suspense>
  );
}
