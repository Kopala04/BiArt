"use client";

import { useRouter } from "next/navigation";
import { createMediaItem, updateMediaItem } from "@/lib/actions/booking";
import { MEDIA_CATEGORY_VALUES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";

type MediaData = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  tags: string | null;
  featured: boolean;
  active: boolean;
};

export function MediaForm({ item }: { item?: MediaData }) {
  const t = useT();
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        if (item) {
          await updateMediaItem(item.id, formData);
        } else {
          await createMediaItem(formData);
        }
        router.refresh();
      }}
      className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <Label>{t.admin.forms.title}</Label>
        <Input name="title" defaultValue={item?.title} required />
      </div>
      <div>
        <Label>{t.admin.forms.category}</Label>
        <select
          name="category"
          defaultValue={item?.category || "OTHER"}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          {MEDIA_CATEGORY_VALUES.map((cat) => (
            <option key={cat} value={cat}>
              {t.mediaCategories[cat]}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.mediaUrl}</Label>
        <Input name="mediaUrl" defaultValue={item?.mediaUrl} required />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.thumbnailUrl}</Label>
        <Input name="thumbnailUrl" defaultValue={item?.thumbnailUrl || ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.description}</Label>
        <Textarea name="description" defaultValue={item?.description || ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.tagsCsv}</Label>
        <Input name="tags" defaultValue={item?.tags || ""} />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={item?.featured} />
          {t.admin.forms.featured}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={item?.active ?? true} />
          {t.admin.forms.active}
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">
          {item ? t.admin.forms.updateMedia : t.admin.forms.addMedia}
        </Button>
      </div>
    </form>
  );
}
