import {
  Camera,
  CreditCard,
  Layout,
  MessageSquare,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { ServiceAnchorScroll } from "@/components/services/ServiceAnchorScroll";
import { db } from "@/lib/db";
import { formatPrice, localized } from "@/lib/utils";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.services.title };
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MessageSquare,
  CreditCard,
  Layout,
  Palette,
  Share2,
  Camera,
  Sparkles,
};


export default async function ServicesPage() {
  const { locale, t } = await getServerDictionary();
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <PublicLayout>
      <ServiceAnchorScroll />
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">{t.services.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            {t.services.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = iconMap[service.icon || "Sparkles"] || Sparkles;
              return (
                <div
                  key={service.id}
                  id={service.slug}
                  className="flex scroll-mt-28 flex-col rounded-2xl border border-slate-200 bg-white p-8 transition hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Icon size={26} />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {localized(locale, service.title, service.titleEn)}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {localized(locale, service.description, service.descriptionEn)}
                  </p>
                  {service.bookable && service.price !== null && (
                    <p className="mt-3 text-sm font-semibold text-amber-600">
                      {service.price === 0 ? t.common.free : formatPrice(service.price, locale)}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {service.bookable ? (
                      <Link href={`/book?service=${service.slug}`}>
                        <Button size="sm">{t.common.bookNow}</Button>
                      </Link>
                    ) : (
                      <Link href="/contact">
                        <Button size="sm">{t.services.getQuote}</Button>
                      </Link>
                    )}
                    <Link href="/contact">
                      <Button variant="outline" size="sm">
                        {t.common.contactUs}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
