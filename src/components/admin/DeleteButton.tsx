"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeleteButton({
  id,
  label,
  onDelete,
}: {
  id: string;
  label: string;
  onDelete: (id: string) => Promise<{ success: boolean }>;
}) {
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="danger"
      onClick={async () => {
        if (confirm(`Are you sure you want to ${label.toLowerCase()}?`)) {
          await onDelete(id);
          router.refresh();
        }
      }}
    >
      {label}
    </Button>
  );
}
