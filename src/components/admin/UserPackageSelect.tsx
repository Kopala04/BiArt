"use client";

import { useRouter } from "next/navigation";
import { updateUserPackage } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/LanguageProvider";

export function UserPackageSelect({
  userId,
  packages,
  currentPackageId,
}: {
  userId: string;
  packages: { id: string; name: string }[];
  currentPackageId: string | null;
}) {
  const t = useT();
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
            {pkg.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm">
        {t.admin.forms.update}
      </Button>
    </form>
  );
}
