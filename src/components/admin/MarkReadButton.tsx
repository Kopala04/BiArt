"use client";

import { useRouter } from "next/navigation";
import { markContactRead } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/LanguageProvider";

export function MarkReadButton({ id }: { id: string }) {
  const t = useT();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      className="mt-2"
      onClick={async () => {
        await markContactRead(id);
        router.refresh();
      }}
    >
      {t.admin.messages.markRead}
    </Button>
  );
}
