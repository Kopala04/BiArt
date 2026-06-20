"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { loginUser, type AuthActionResult } from "@/lib/actions/auth";
import { useT } from "@/components/i18n/LanguageProvider";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: AuthActionResult, formData: FormData) => {
      const result = await loginUser(formData);
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
          <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.auth.loginSubtitle}</p>

          <form action={action} className="mt-8 space-y-5">
            {state && "error" in state && state.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </p>
            )}
            <div>
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-medium text-amber-600 hover:underline">
              {t.auth.registerHere}
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
