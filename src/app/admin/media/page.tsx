import Link from "next/link";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { MediaForm } from "@/components/admin/MediaForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteMediaItem } from "@/lib/actions/media";
import { mediaConfig } from "@/lib/media/config";
import { getServerDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n";
import { isVideoUrl, mediaPreviewUrl } from "@/lib/media-url";
import { localized } from "@/lib/utils";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.admin.media.title };
}

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { locale, t } = await getServerDictionary();
  const page = Number.parseInt(params.page ?? "1", 10);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const pageSize = mediaConfig.limits.pageSize;
  const skip = (safePage - 1) * pageSize;

  const [items, total] = await Promise.all([
    db.mediaItem.findMany({
      orderBy: { sortOrder: "asc" },
      skip,
      take: pageSize,
    }),
    db.mediaItem.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.admin.media.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {fill(t.admin.media.totalCount, { count: String(total) })}
          </p>
        </div>
      </div>
      <MediaForm />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const preview = mediaPreviewUrl(item.mediaUrl, item.thumbnailUrl);
          const showVideo = isVideoUrl(item.mediaUrl) && !item.thumbnailUrl;

          return (
            <div
              key={item.id}
              className="interactive-card overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-video bg-slate-100">
                {showVideo ? (
                  <video
                    src={item.mediaUrl}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <RemoteImage
                    src={preview}
                    alt={localized(locale, item.title, item.titleEn)}
                    fill
                    className="object-cover"
                  />
                )}
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
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {safePage > 1 && (
            <Link
              href={`/admin/media?page=${safePage - 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              {t.common.back}
            </Link>
          )}
          <span className="text-sm text-slate-600">
            {fill(t.admin.media.pageOf, {
              page: String(safePage),
              total: String(totalPages),
            })}
          </span>
          {safePage < totalPages && (
            <Link
              href={`/admin/media?page=${safePage + 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              {t.common.continue}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
