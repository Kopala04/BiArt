"use client";

import { useRouter } from "next/navigation";
import {
  createPrintCategory,
  updatePrintCategory,
} from "@/lib/actions/print-catalog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";

type CategoryData = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  icon: string | null;
  active: boolean;
  sortOrder: number;
};

export function PrintCategoryForm({ category }: { category?: CategoryData }) {
  const t = useT();
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        if (category) {
          await updatePrintCategory(category.id, formData);
        } else {
          await createPrintCategory(formData);
        }
        router.refresh();
      }}
      className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <Label>{t.admin.forms.name}</Label>
        <Input name="name" defaultValue={category?.name} required />
      </div>
      <div>
        <Label>{t.admin.forms.nameEn}</Label>
        <Input name="nameEn" defaultValue={category?.nameEn ?? ""} />
      </div>
      <div>
        <Label>{t.admin.forms.slug}</Label>
        <Input name="slug" defaultValue={category?.slug} />
      </div>
      <div>
        <Label>{t.admin.forms.iconLucide}</Label>
        <Input
          name="icon"
          defaultValue={category?.icon ?? "Package"}
          placeholder="Shirt, Glasses, Coffee..."
        />
      </div>
      <div>
        <Label>{t.admin.forms.sortOrder}</Label>
        <Input
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
        />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={category?.active ?? true}
          />
          {t.admin.forms.active}
        </label>
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.description}</Label>
        <Textarea
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.descriptionEn}</Label>
        <Textarea
          name="descriptionEn"
          rows={2}
          defaultValue={category?.descriptionEn ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">
          {category ? t.admin.print.saveCategory : t.admin.print.addCategory}
        </Button>
      </div>
    </form>
  );
}
