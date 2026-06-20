import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { db } from "@/lib/db";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { localized } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.portfolio.title };
}

export default async function PortfolioPage() {
  const locale = await getLocale();
  const items = await db.mediaItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const localizedItems = items.map((item) => ({
    id: item.id,
    title: localized(locale, item.title, item.titleEn),
    description:
      item.description === null
        ? null
        : localized(locale, item.description, item.descriptionEn),
    category: item.category,
    mediaUrl: item.mediaUrl,
    thumbnailUrl: item.thumbnailUrl,
    tags: item.tags === null ? null : localized(locale, item.tags, item.tagsEn),
  }));

  return <PortfolioGallery initialItems={localizedItems} />;
}
