"use client";

import { useRouter } from "next/navigation";
import { createService, updateService } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

type ServiceData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  featured: boolean;
  active: boolean;
};

export function ServiceForm({ service }: { service?: ServiceData }) {
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
        <Label>Title</Label>
        <Input name="title" defaultValue={service?.title} required />
      </div>
      <div>
        <Label>Slug</Label>
        <Input name="slug" defaultValue={service?.slug} />
      </div>
      <div>
        <Label>Icon (Lucide name)</Label>
        <Input name="icon" defaultValue={service?.icon || "Sparkles"} />
      </div>
      <div className="flex items-end gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={service?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} />
          Active
        </label>
      </div>
      <div className="sm:col-span-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={service?.description} required />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">{service ? "Update Service" : "Add Service"}</Button>
      </div>
    </form>
  );
}
