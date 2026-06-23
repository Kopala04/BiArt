import Link from "next/link";
import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { db } from "@/lib/db";
import { formatPrice, parseServices, localized, serviceActionHref } from "@/lib/utils";
import { mediaPreviewUrl } from "@/lib/media-url";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function HomePage() {
  const { locale, t } = await getServerDictionary();
  const [featuredServices, packages, featuredMedia] = await Promise.all([
    db.service.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    db.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.mediaItem.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="theme-hero relative overflow-hidden bg-[color:var(--hero-bg)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[color:var(--brand)]/25 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
              {t.home.heroBadge}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.heroTitleA}{" "}
              <span className="text-amber-400">{t.home.heroTitleHighlight}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/book?service=b2b-consultations">
                <Button size="lg">
                  {t.home.bookConsultation}
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" size="lg" className="border-white/35 text-white hover:bg-white/10">
                  {t.home.viewWork}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: Award, label: t.home.statYearsLabel, sub: t.home.statYearsSub },
              { icon: Users, label: t.home.statClientsLabel, sub: t.home.statClientsSub },
              { icon: Camera, label: t.home.statProjectsLabel, sub: t.home.statProjectsSub },
              { icon: Sparkles, label: t.home.statPremiumLabel, sub: t.home.statPremiumSub },
            ].map((stat) => (
              <div key={stat.label} className="interactive-lift rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <stat.icon className="mb-2 text-amber-400" size={24} />
                <p className="text-xl font-bold">{stat.label}</p>
                <p className="text-xs text-slate-400">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t.home.servicesTitle}</h2>
            <p className="mt-3 text-slate-600">{t.home.servicesSubtitle}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="interactive-lift group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Palette size={22} />
                </div>
                <h3 className="text-lg font-semibold">
                  {localized(locale, service.title, service.titleEn)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {localized(locale, service.description, service.descriptionEn)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/services#${service.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 transition group-hover:gap-2"
                  >
                    {t.home.learnMore} <ArrowRight size={14} />
                  </Link>
                  {service.bookable && (
                    <Link href={serviceActionHref(service.slug)}>
                      <Button size="sm" variant="outline">
                        {service.slug === "b2b-consultations"
                          ? t.common.bookNow
                          : t.common.orderNow}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services">
              <Button variant="outline">{t.home.viewAllServices}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t.home.packagesTitle}</h2>
            <p className="mt-3 text-slate-600">{t.home.packagesSubtitle}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`interactive-lift relative rounded-2xl border p-8 ${
                  pkg.featured
                    ? "package-featured"
                    : "border-slate-200 bg-white"
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white">
                    {t.common.mostPopular}
                  </span>
                )}
                <h3 className="text-xl font-bold">
                  {localized(locale, pkg.name, pkg.nameEn)}
                </h3>
                <p className={`mt-2 text-3xl font-bold ${pkg.featured ? "text-amber-400" : "text-slate-900"}`}>
                  {formatPrice(pkg.price, locale)}
                </p>
                <p className={`mt-3 text-sm ${pkg.featured ? "text-slate-300" : "text-slate-600"}`}>
                  {localized(locale, pkg.description, pkg.descriptionEn)}
                </p>
                <ul className="mt-6 space-y-2">
                  {parseServices(localized(locale, pkg.services, pkg.servicesEn)).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        size={16}
                        className={`mt-0.5 shrink-0 ${pkg.featured ? "text-amber-400" : "text-amber-500"}`}
                      />
                      <span className={pkg.featured ? "text-slate-200" : "text-slate-700"}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={`/book?package=${pkg.slug}`} className="mt-8 block">
                  <Button
                    className="w-full"
                    variant={pkg.featured ? "primary" : "secondary"}
                  >
                    {t.home.book} {localized(locale, pkg.name, pkg.nameEn)}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t.home.featuredWorkTitle}</h2>
              <p className="mt-3 text-slate-600">{t.home.featuredWorkSubtitle}</p>
            </div>
            <Link href="/portfolio" className="hidden sm:block">
              <Button variant="outline">{t.home.viewPortfolio}</Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredMedia.map((item) => (
              <div
                key={item.id}
                className="interactive-card group overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <RemoteImage
                    src={mediaPreviewUrl(item.mediaUrl, item.thumbnailUrl)}
                    alt={localized(locale, item.title, item.titleEn)}
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
                  <h3 className="font-semibold">
                    {localized(locale, item.title, item.titleEn)}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {localized(locale, item.description, item.descriptionEn)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-hero py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold">{t.home.ctaTitle}</h2>
          <p className="mt-4 text-slate-300">{t.home.ctaSubtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/packages">
              <Button size="lg">{t.home.getStarted}</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-slate-600 text-white hover:bg-slate-800">
                {t.common.contactUs}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
