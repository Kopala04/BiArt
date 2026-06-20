import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono, Unkempt } from "next/font/google";
import "./globals.css";
import { getServerDictionary } from "@/lib/i18n/server";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";

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

const arialGeo = localFont({
  src: "./fonts/arial-geo.woff2",
  variable: "--font-arial-geo",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t } = await getServerDictionary();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${unkempt.variable} ${arialGeo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider locale={locale} dict={t}>
          <SessionProvider>{children}</SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
