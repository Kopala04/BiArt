"use client";

import { useRouter } from "next/navigation";
import { markContactRead } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";

export function MarkReadButton({ id }: { id: string }) {
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
      Mark as read
    </Button>
  );
}
