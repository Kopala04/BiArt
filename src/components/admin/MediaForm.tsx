"use client";

import { useRouter } from "next/navigation";
import { createMediaItem, updateMediaItem } from "@/lib/actions/booking";
import { MEDIA_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

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
        <Label>Title</Label>
        <Input name="title" defaultValue={item?.title} required />
      </div>
      <div>
        <Label>Category</Label>
        <select
          name="category"
          defaultValue={item?.category || "OTHER"}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          {MEDIA_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label>Media URL</Label>
        <Input name="mediaUrl" defaultValue={item?.mediaUrl} required />
      </div>
      <div className="sm:col-span-2">
        <Label>Thumbnail URL</Label>
        <Input name="thumbnailUrl" defaultValue={item?.thumbnailUrl || ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={item?.description || ""} />
      </div>
      <div className="sm:col-span-2">
        <Label>Tags (comma-separated)</Label>
        <Input name="tags" defaultValue={item?.tags || ""} />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={item?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={item?.active ?? true} />
          Active
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">{item ? "Update Media" : "Add Media"}</Button>
      </div>
    </form>
  );
}
