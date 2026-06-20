"use client";

import { useRouter } from "next/navigation";
import { createService, updateService } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";

type ServiceData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  price: number | null;
  bookable: boolean;
  featured: boolean;
  active: boolean;
};

export function ServiceForm({ service }: { service?: ServiceData }) {
  const t = useT();
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        if (service) {
          await updateService(service.id, formData);
        } else {
          await createService(formData);
        }
        router.refresh();
      }}
      className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <Label>{t.admin.forms.title}</Label>
        <Input name="title" defaultValue={service?.title} required />
      </div>
      <div>
        <Label>{t.admin.forms.slug}</Label>
        <Input name="slug" defaultValue={service?.slug} />
      </div>
      <div>
        <Label>{t.admin.forms.priceOptional}</Label>
        <Input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={service?.price ?? ""}
        />
      </div>
      <div>
        <Label>{t.admin.forms.iconLucide}</Label>
        <Input name="icon" defaultValue={service?.icon || "Sparkles"} />
      </div>
      <div className="flex flex-wrap items-end gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="bookable" defaultChecked={service?.bookable} />
          {t.admin.forms.bookableIndividually}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={service?.featured} />
          {t.admin.forms.featured}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} />
          {t.admin.forms.active}
        </label>
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.description}</Label>
        <Textarea name="description" defaultValue={service?.description} required />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">
          {service ? t.admin.forms.updateService : t.admin.forms.addService}
        </Button>
      </div>
    </form>
  );
}
