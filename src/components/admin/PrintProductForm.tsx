"use client";

import { useRouter } from "next/navigation";
import {
  createPrintProduct,
  updatePrintProduct,
} from "@/lib/actions/print-catalog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useT } from "@/components/i18n/LanguageProvider";

type ProductData = {
  id: string;
  categoryId: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  price: number;
  priceNote: string | null;
  priceNoteEn: string | null;
  minQuantity: number | null;
  maxQuantity: number;
  unit: string | null;
  unitEn: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
};

export function PrintProductForm({
  categoryId,
  product,
}: {
  categoryId: string;
  product?: ProductData;
}) {
  const t = useT();
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        if (product) {
          await updatePrintProduct(product.id, formData);
        } else {
          formData.set("categoryId", categoryId);
          await createPrintProduct(formData);
        }
        router.refresh();
      }}
      className="mt-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2"
    >
      <input type="hidden" name="categoryId" value={categoryId} />
      <div>
        <Label>{t.admin.forms.name}</Label>
        <Input name="name" defaultValue={product?.name} required />
      </div>
      <div>
        <Label>{t.admin.forms.nameEn}</Label>
        <Input name="nameEn" defaultValue={product?.nameEn ?? ""} />
      </div>
      <div>
        <Label>{t.admin.forms.slug}</Label>
        <Input name="slug" defaultValue={product?.slug} />
      </div>
      <div>
        <Label>{t.admin.forms.price}</Label>
        <Input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.price}
          required
        />
      </div>
      <div>
        <Label>{t.admin.print.priceNote}</Label>
        <Input name="priceNote" defaultValue={product?.priceNote ?? ""} />
      </div>
      <div>
        <Label>{t.admin.print.priceNoteEn}</Label>
        <Input name="priceNoteEn" defaultValue={product?.priceNoteEn ?? ""} />
      </div>
      <div>
        <Label>{t.admin.print.maxQuantity}</Label>
        <Input
          name="maxQuantity"
          type="number"
          min="1"
          defaultValue={product?.maxQuantity ?? 5}
          required
        />
      </div>
      <div>
        <Label>{t.admin.print.unit}</Label>
        <Input name="unit" defaultValue={product?.unit ?? ""} placeholder="ცალი" />
      </div>
      <div>
        <Label>{t.admin.print.unitEn}</Label>
        <Input name="unitEn" defaultValue={product?.unitEn ?? ""} placeholder="pc" />
      </div>
      <div>
        <Label>{t.admin.forms.sortOrder}</Label>
        <Input
          name="sortOrder"
          type="number"
          defaultValue={product?.sortOrder ?? 0}
        />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
          />
          {t.admin.forms.active}
        </label>
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.imageUrl}</Label>
        <Input
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={product?.imageUrl ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.description}</Label>
        <Textarea
          name="description"
          rows={2}
          defaultValue={product?.description ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>{t.admin.forms.descriptionEn}</Label>
        <Textarea
          name="descriptionEn"
          rows={2}
          defaultValue={product?.descriptionEn ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm">
          {product ? t.admin.print.saveProduct : t.admin.print.addProduct}
        </Button>
      </div>
    </form>
  );
}
