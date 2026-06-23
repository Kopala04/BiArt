import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono, Space_Mono, Unkempt } from "next/font/google";
import "./globals.css";
import { getServerDictionary } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PrintCategoriesProvider } from "@/components/providers/PrintCategoriesProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unkempt = Unkempt({
  variable: "--font-unkempt",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const alkSanet = localFont({
  src: "./fonts/alk-sanet.woff2",
  variable: "--font-alk-sanet",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bi Art — Advertising & Media Production",
    template: "%s | Bi Art",
  },
  description:
    "Premium advertising and media production agency established in 2007. Branding, campaigns, video production, and more.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/** App reads cookies, auth, and DB on every request — skip static prerender at build. */
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t } = await getServerDictionary();
  const [printCategories, session] = await Promise.all([
    db.printCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, nameEn: true },
    }),
    getSession(),
  ]);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${unkempt.variable} ${spaceMono.variable} ${alkSanet.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider locale={locale} dict={t}>
            <PrintCategoriesProvider categories={printCategories}>
              <SessionProvider session={session}>{children}</SessionProvider>
            </PrintCategoriesProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
