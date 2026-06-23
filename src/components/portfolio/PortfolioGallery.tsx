"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/Input";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { MEDIA_CATEGORY_VALUES } from "@/lib/constants";
import { mediaPreviewUrl } from "@/lib/media-url";
import { useT } from "@/components/i18n/LanguageProvider";

type MediaItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  tags: string | null;
};

export function PortfolioGallery({ initialItems }: { initialItems: MediaItem[] }) {
  const t = useT();
  const [items] = useState(initialItems);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === "ALL" || item.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, category, search]);

  return (
    <PublicLayout>
      <section className="page-hero py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">{t.portfolio.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            {t.portfolio.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("ALL")}
                aria-pressed={category === "ALL"}
                className={`interactive-scale rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                  category === "ALL"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                }`}
              >
                {t.portfolio.all}
              </button>
              {MEDIA_CATEGORY_VALUES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  className={`interactive-scale rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                    category === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                  }`}
                >
                  {t.mediaCategories[cat]}
                </button>
              ))}
            </div>
            <div className="relative max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                placeholder={t.portfolio.searchPlaceholder}
                aria-label={t.portfolio.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-20 text-center text-slate-500">
              {t.portfolio.noResults}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="interactive-card group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <RemoteImage
                      src={mediaPreviewUrl(item.mediaUrl, item.thumbnailUrl)}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {t.mediaCategories[
                        item.category as keyof typeof t.mediaCategories
                      ] ?? item.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="font-semibold">{item.title}</h2>
                    {item.description && (
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description}
                      </p>
                    )}
                    {item.tags && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.split(",").map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
