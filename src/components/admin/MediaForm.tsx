"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { createMediaItem, updateMediaItem } from "@/lib/actions/media";
import { MEDIA_CATEGORY_VALUES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";
import {
  MediaUploader,
  type UploadedMediaPayload,
} from "@/components/admin/MediaUploader";

type MediaData = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  category: string;
  mediaUrl: string;
  mediaStorageKey?: string | null;
  thumbnailUrl: string | null;
  thumbnailStorageKey?: string | null;
  tags: string | null;
  tagsEn: string | null;
  featured: boolean;
  active: boolean;
};

type FormState = { error?: string; success?: boolean } | null;

export function MediaForm({ item }: { item?: MediaData }) {
  const t = useT();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploaded, setUploaded] = useState<UploadedMediaPayload>({});

  const action = item
    ? updateMediaItem.bind(null, item.id)
    : createMediaItem;

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        return { error: result.error };
      }
      formRef.current?.reset();
      setUploaded({});
      router.refresh();
      return { success: true };
    },
    null
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <Label>{t.admin.forms.title}</Label>
        <Input name="title" defaultValue={item?.title} required />
      </div>
      <div>
        <Label>{t.admin.forms.titleEn}</Label>
        <Input name="titleEn" defaultValue={item?.titleEn ?? ""} />
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

      <MediaUploader onUploaded={setUploaded} disabled={pending} />

      {uploaded.mediaStorageKey && (
        <input type="hidden" name="mediaStorageKey" value={uploaded.mediaStorageKey} />
      )}
      {uploaded.thumbnailStorageKey && (
        <input
          type="hidden"
          name="thumbnailStorageKey"
          value={uploaded.thumbnailStorageKey}
        />
      )}

      {(uploaded.mediaUrl || uploaded.thumbnailUrl) && (
        <div className="sm:col-span-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {t.admin.forms.uploadReady}
        </div>
      )}

      <div className="sm:col-span-2">
        <p className="text-sm font-medium text-slate-700">{t.admin.forms.orPasteUrl}</p>
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.mediaUrl}</Label>
        <Input
          name="mediaUrl"
          value={uploaded.mediaUrl ?? item?.mediaUrl ?? ""}
          onChange={(e) =>
            setUploaded((prev) => ({ ...prev, mediaUrl: e.target.value }))
          }
          placeholder={item ? t.admin.forms.keepExistingUrl : "https://..."}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.thumbnailUrl}</Label>
        <Input
          name="thumbnailUrl"
          value={uploaded.thumbnailUrl ?? item?.thumbnailUrl ?? ""}
          onChange={(e) =>
            setUploaded((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
          }
          placeholder="https://..."
        />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.description}</Label>
        <Textarea name="description" defaultValue={item?.description || ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.descriptionEn}</Label>
        <Textarea name="descriptionEn" defaultValue={item?.descriptionEn ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.tagsCsv}</Label>
        <Input name="tags" defaultValue={item?.tags || ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.tagsCsvEn}</Label>
        <Input name="tagsEn" defaultValue={item?.tagsEn ?? ""} />
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
      {state?.error && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? t.admin.forms.savingMedia
            : item
              ? t.admin.forms.updateMedia
              : t.admin.forms.addMedia}
        </Button>
      </div>
    </form>
  );
}
