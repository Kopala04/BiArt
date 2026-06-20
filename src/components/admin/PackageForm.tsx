"use client";

import { useRouter } from "next/navigation";
import { createPackage, updatePackage } from "@/lib/actions/booking";
import { parseServices } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";

type PackageData = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  price: number;
  description: string;
  descriptionEn: string | null;
  services: string;
  servicesEn: string | null;
  featured: boolean;
  active: boolean;
};

export function PackageForm({ pkg }: { pkg?: PackageData }) {
  const t = useT();
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        if (pkg) {
          await updatePackage(pkg.id, formData);
        } else {
          await createPackage(formData);
        }
        router.refresh();
      }}
      className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <Label>{t.admin.forms.name}</Label>
        <Input name="name" defaultValue={pkg?.name} required />
      </div>
      <div>
        <Label>{t.admin.forms.nameEn}</Label>
        <Input name="nameEn" defaultValue={pkg?.nameEn ?? ""} />
      </div>
      <div>
        <Label>{t.admin.forms.slug}</Label>
        <Input name="slug" defaultValue={pkg?.slug} />
      </div>
      <div>
        <Label>{t.admin.forms.price}</Label>
        <Input name="price" type="number" step="0.01" defaultValue={pkg?.price} required />
      </div>
      <div className="flex items-end gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={pkg?.featured} />
          {t.admin.forms.featured}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={pkg?.active ?? true} />
          {t.admin.forms.active}
        </label>
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.description}</Label>
        <Textarea name="description" defaultValue={pkg?.description} required />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.descriptionEn}</Label>
        <Textarea name="descriptionEn" defaultValue={pkg?.descriptionEn ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.includedServices}</Label>
        <Textarea
          name="services"
          rows={5}
          defaultValue={pkg ? parseServices(pkg.services).join("\n") : ""}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.includedServicesEn}</Label>
        <Textarea
          name="servicesEn"
          rows={5}
          defaultValue={pkg ? parseServices(pkg.servicesEn ?? "").join("\n") : ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">
          {pkg ? t.admin.forms.updatePackage : t.admin.forms.addPackage}
        </Button>
      </div>
    </form>
  );
}
