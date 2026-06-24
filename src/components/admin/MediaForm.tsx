"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createMediaItem, updateMediaItem } from "@/lib/actions/media";
import { MEDIA_CATEGORY_VALUES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";
import {
  MediaUploader,
  type MediaUploaderHandle,
  type MediaUploaderStatus,
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

export function MediaForm({ item }: { item?: MediaData }) {
  const t = useT();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const uploaderRef = useRef<MediaUploaderHandle>(null);
  const [uploaded, setUploaded] = useState<UploadedMediaPayload>({});
  const [uploadStatus, setUploadStatus] = useState<MediaUploaderStatus>({
    uploading: false,
    hasPendingFiles: false,
    hasUploadedMedia: !!item?.mediaUrl,
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const action = item
    ? updateMediaItem.bind(null, item.id)
    : createMediaItem;

  const mediaUrlValue = uploaded.mediaUrl ?? item?.mediaUrl ?? "";
  const thumbUrlValue = uploaded.thumbnailUrl ?? item?.thumbnailUrl ?? "";
  const canSave =
    !isPending &&
    !uploadStatus.uploading &&
    (mediaUrlValue.trim().length > 0 ||
      !!uploaded.mediaStorageKey ||
      !!item?.mediaUrl);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    if (uploadStatus.uploading) {
      setClientError(t.admin.forms.uploadPending);
      return;
    }

    if (uploadStatus.hasPendingFiles) {
      const ok = await uploaderRef.current?.ensureUploaded();
      if (!ok) {
        setClientError(t.admin.forms.uploadErrors.failed);
        return;
      }
    }

    const formData = new FormData(event.currentTarget);
    const currentMediaUrl = uploaded.mediaUrl ?? formData.get("mediaUrl")?.toString().trim();
    const currentThumbUrl =
      uploaded.thumbnailUrl ?? formData.get("thumbnailUrl")?.toString().trim();

    if (currentMediaUrl) formData.set("mediaUrl", currentMediaUrl);
    if (currentThumbUrl) formData.set("thumbnailUrl", currentThumbUrl);
    if (uploaded.mediaStorageKey) {
      formData.set("mediaStorageKey", uploaded.mediaStorageKey);
    }
    if (uploaded.thumbnailStorageKey) {
      formData.set("thumbnailStorageKey", uploaded.thumbnailStorageKey);
    }

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        setClientError(result.error);
        return;
      }

      formRef.current?.reset();
      setUploaded({});
      router.refresh();
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
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

      <MediaUploader
        ref={uploaderRef}
        onUploaded={setUploaded}
        onStatusChange={setUploadStatus}
        disabled={isPending}
      />

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
      {uploaded.mediaUrl && (
        <input type="hidden" name="mediaUrl" value={uploaded.mediaUrl} />
      )}
      {uploaded.thumbnailUrl && (
        <input type="hidden" name="thumbnailUrl" value={uploaded.thumbnailUrl} />
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
          value={mediaUrlValue}
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
          value={thumbUrlValue}
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
      {clientError && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {clientError}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={!canSave}>
          {isPending
            ? t.admin.forms.savingMedia
            : item
              ? t.admin.forms.updateMedia
              : t.admin.forms.addMedia}
        </Button>
      </div>
    </form>
  );
}
