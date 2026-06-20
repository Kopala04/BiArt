"use client";

import { useRouter } from "next/navigation";
import { updateUserPackage } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { useT, useLocale } from "@/components/i18n/LanguageProvider";
import { localized } from "@/lib/utils";

export function UserPackageSelect({
  userId,
  packages,
  currentPackageId,
}: {
  userId: string;
  packages: { id: string; name: string; nameEn: string | null }[];
  currentPackageId: string | null;
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  return (
    <form
      className="mt-3 flex gap-2"
      action={async (formData) => {
        const packageId = formData.get("packageId") as string;
        await updateUserPackage(userId, packageId || null);
        router.refresh();
      }}
    >
      <select
        name="packageId"
        defaultValue={currentPackageId || ""}
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="">{t.admin.forms.noPackage}</option>
        {packages.map((pkg) => (
          <option key={pkg.id} value={pkg.id}>
            {localized(locale, pkg.name, pkg.nameEn)}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm">
        {t.admin.forms.update}
      </Button>
    </form>
  );
}
