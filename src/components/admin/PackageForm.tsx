"use client";

import { useRouter } from "next/navigation";
import { createPackage, updatePackage } from "@/lib/actions/booking";
import { parseServices } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

type PackageData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  services: string;
  featured: boolean;
  active: boolean;
};

export function PackageForm({ pkg }: { pkg?: PackageData }) {
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
        <Label>Name</Label>
        <Input name="name" defaultValue={pkg?.name} required />
      </div>
      <div>
        <Label>Slug</Label>
        <Input name="slug" defaultValue={pkg?.slug} />
      </div>
      <div>
        <Label>Price</Label>
        <Input name="price" type="number" step="0.01" defaultValue={pkg?.price} required />
      </div>
      <div className="flex items-end gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={pkg?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={pkg?.active ?? true} />
          Active
        </label>
      </div>
      <div className="sm:col-span-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={pkg?.description} required />
      </div>
      <div className="sm:col-span-2">
        <Label>Included Services (one per line)</Label>
        <Textarea
          name="services"
          rows={5}
          defaultValue={pkg ? parseServices(pkg.services).join("\n") : ""}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">{pkg ? "Update Package" : "Add Package"}</Button>
      </div>
    </form>
  );
}
