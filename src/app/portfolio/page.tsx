import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { db } from "@/lib/db";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const items = await db.mediaItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return <PortfolioGallery initialItems={items} />;
}
