import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      <div aria-hidden className="h-[var(--header-h)] shrink-0" />
      <main className="flex-1">{children}</main>
      <Footer />
    </SessionProvider>
  );
}
