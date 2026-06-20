"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/LanguageProvider";
import { fill } from "@/lib/i18n";

export function DeleteButton({
  id,
  label,
  onDelete,
}: {
  id: string;
  label: string;
  onDelete: (id: string) => Promise<{ success: boolean }>;
}) {
  const t = useT();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="danger"
      onClick={async () => {
        if (
          confirm(
            fill(t.admin.forms.confirmDelete, { action: label.toLowerCase() })
          )
        ) {
          await onDelete(id);
          router.refresh();
        }
      }}
    >
      {label}
    </Button>
  );
}
