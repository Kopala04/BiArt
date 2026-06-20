import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div aria-hidden className="h-[var(--header-h)] shrink-0" />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
