import { db } from "@/lib/db";
import RegisterPageWrapper from "@/components/auth/RegisterForm";

export const metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const params = await searchParams;
  const packages = await db.package.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const preselectedId =
    packages.find((p) => p.slug === params.package)?.id || "";

  return (
    <RegisterPageWrapper
      packages={packages}
      preselectedPackageId={preselectedId}
    />
  );
}
