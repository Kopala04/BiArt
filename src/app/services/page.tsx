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
import { db } from "@/lib/db";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MessageSquare,
  CreditCard,
  Layout,
  Palette,
  Share2,
  Camera,
  Sparkles,
};

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <PublicLayout>
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Comprehensive advertising and media production services tailored for
            B2B clients who demand excellence.
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
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Icon size={26} />
                  </div>
                  <h2 className="text-xl font-semibold">{service.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Link href="/book">
                      <Button size="sm">Book Now</Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" size="sm">
                        Contact Us
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
