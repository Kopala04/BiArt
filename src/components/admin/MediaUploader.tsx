"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, RotateCcw } from "lucide-react";
import { randomUUID } from "@/lib/utils-client";
import {
  uploadMediaBatch,
  type ClientUploadProgress,
} from "@/lib/media/client-upload";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { useT } from "@/components/i18n/LanguageProvider";

export type UploadedMediaPayload = {
  mediaUrl?: string;
  mediaStorageKey?: string;
  thumbnailUrl?: string;
  thumbnailStorageKey?: string;
};

type Slot = "media" | "thumbnail";

type FileSlotState = {
  file: File | null;
  progress: number;
  error: string | null;
  uploading: boolean;
};

const ACCEPT_MEDIA =
  "image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime";
const ACCEPT_THUMB = "image/jpeg,image/png,image/gif,image/webp,image/avif";

export function MediaUploader({
  onUploaded,
  disabled,
}: {
  onUploaded: (payload: UploadedMediaPayload) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const abortRef = useRef<AbortController | null>(null);
  const [dragOver, setDragOver] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Record<Slot, FileSlotState>>({
    media: { file: null, progress: 0, error: null, uploading: false },
    thumbnail: { file: null, progress: 0, error: null, uploading: false },
  });

  const setSlot = useCallback((slot: Slot, patch: Partial<FileSlotState>) => {
    setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], ...patch } }));
  }, []);

  const assignFile = (slot: Slot, file: File | null) => {
    setSlot(slot, { file, error: null, progress: 0, uploading: false });
  };

  const handleDrop = (slot: Slot, event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) assignFile(slot, file);
  };

  const runUpload = async (retry = false) => {
    const mediaFile = slots.media.file;
    const thumbnailFile = slots.thumbnail.file;
    if (!mediaFile && !thumbnailFile) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSlot("media", { uploading: !!mediaFile, error: null, progress: 0 });
    setSlot("thumbnail", {
      uploading: !!thumbnailFile,
      error: null,
      progress: 0,
    });

    const onProgress = (progress: ClientUploadProgress) => {
      if (mediaFile) setSlot("media", { progress: progress.percent });
      if (thumbnailFile) setSlot("thumbnail", { progress: progress.percent });
    };

    const result = await uploadMediaBatch({
      mediaFile,
      thumbnailFile,
      mediaIdempotencyKey: mediaFile ? randomUUID() : undefined,
      thumbnailIdempotencyKey: thumbnailFile ? randomUUID() : undefined,
      signal: controller.signal,
      onProgress,
    });

    if (result.error) {
      const message =
        t.admin.forms.uploadErrors[
          result.error as keyof typeof t.admin.forms.uploadErrors
        ] ?? t.admin.forms.uploadErrors.failed;
      if (mediaFile) setSlot("media", { uploading: false, error: message });
      if (thumbnailFile) setSlot("thumbnail", { uploading: false, error: message });
      return;
    }

    setSlot("media", { uploading: false, progress: 100, error: null });
    setSlot("thumbnail", { uploading: false, progress: 100, error: null });

    onUploaded({
      mediaUrl: result.media?.publicUrl,
      mediaStorageKey: result.media?.storageKey,
      thumbnailUrl: result.thumbnail?.publicUrl,
      thumbnailStorageKey: result.thumbnail?.storageKey,
    });

    if (!retry) {
      setSlot("media", { file: null, progress: 0 });
      setSlot("thumbnail", { file: null, progress: 0 });
    }
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
    setSlot("media", { uploading: false });
    setSlot("thumbnail", { uploading: false });
  };

  const renderDropzone = (slot: Slot, label: string, hint: string, accept: string) => {
    const state = slots[slot];
    const inputId = `${slot}-file-input`;

    return (
      <div>
        <Label htmlFor={inputId}>{label}</Label>
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(slot);
          }}
          onDragLeave={() => setDragOver((current) => (current === slot ? null : current))}
          onDrop={(e) => handleDrop(slot, e)}
          className={`mt-2 rounded-xl border border-dashed p-4 transition ${
            dragOver === slot
              ? "border-amber-400 bg-amber-50/60"
              : "border-slate-200 bg-white"
          }`}
        >
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled || state.uploading}
            onChange={(e) => assignFile(slot, e.target.files?.[0] ?? null)}
          />
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center gap-2 text-center text-sm text-slate-600"
          >
            <Upload size={20} className="text-slate-400" aria-hidden />
            <span>{t.admin.forms.dragDropHint}</span>
          </label>
          {state.file && (
            <p className="mt-2 truncate text-center text-xs font-medium text-slate-800">
              {state.file.name}
            </p>
          )}
          {state.uploading && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="mt-1 text-center text-xs text-slate-500">
                {state.progress}%
              </p>
            </div>
          )}
          {state.error && (
            <p className="mt-2 text-center text-xs text-red-600">{state.error}</p>
          )}
        </div>
      </div>
    );
  };

  const isUploading = slots.media.uploading || slots.thumbnail.uploading;
  const canUpload = !!(slots.media.file || slots.thumbnail.file) && !isUploading;

  return (
    <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm font-medium text-slate-800">{t.admin.forms.uploadFromPc}</p>
      <p className="mt-1 text-xs text-slate-500">{t.admin.forms.uploadFromPcHint}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {renderDropzone(
          "media",
          t.admin.forms.mediaFile,
          t.admin.forms.mediaFileHint,
          ACCEPT_MEDIA
        )}
        {renderDropzone(
          "thumbnail",
          t.admin.forms.thumbnailFile,
          t.admin.forms.thumbnailFileHint,
          ACCEPT_THUMB
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!canUpload || disabled}
          onClick={() => runUpload(false)}
        >
          {t.admin.forms.uploadFiles}
        </Button>
        {isUploading && (
          <Button type="button" size="sm" variant="outline" onClick={cancelUpload}>
            <X size={14} className="mr-1" />
            {t.admin.forms.cancelUpload}
          </Button>
        )}
        {(slots.media.error || slots.thumbnail.error) && (
          <Button type="button" size="sm" variant="ghost" onClick={() => runUpload(true)}>
            <RotateCcw size={14} className="mr-1" />
            {t.admin.forms.retryUpload}
          </Button>
        )}
      </div>
    </div>
  );
}
