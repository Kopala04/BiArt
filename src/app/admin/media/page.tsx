import Image from "next/image";
import { db } from "@/lib/db";
import { MediaForm } from "@/components/admin/MediaForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteMediaItem } from "@/lib/actions/booking";
import { getServerDictionary } from "@/lib/i18n/server";
import { localized } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.admin.media.title };
}

export default async function AdminMediaPage() {
  const { locale, t } = await getServerDictionary();
  const items = await db.mediaItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.admin.media.title}</h1>
      <MediaForm />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="relative aspect-video">
              <Image
                src={item.thumbnailUrl || item.mediaUrl}
                alt={localized(locale, item.title, item.titleEn)}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">
                    {localized(locale, item.title, item.titleEn)}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t.mediaCategories[
                      item.category as keyof typeof t.mediaCategories
                    ] ?? item.category}
                  </p>
                </div>
                <DeleteButton
                  id={item.id}
                  label={t.admin.media.delete}
                  onDelete={deleteMediaItem}
                />
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-amber-600">
                  {t.admin.media.edit}
                </summary>
                <MediaForm item={item} />
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
