"use client";

import { useRouter } from "next/navigation";
import { deleteBooking, updateBookingStatus } from "@/lib/actions/booking";
import { BOOKING_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function BookingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={status}
        onChange={async (e) => {
          await updateBookingStatus(id, e.target.value);
          router.refresh();
        }}
        className="rounded border border-slate-200 px-2 py-1 text-xs"
      >
        {BOOKING_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="danger"
        onClick={async () => {
          if (confirm("Delete this booking?")) {
            await deleteBooking(id);
            router.refresh();
          }
        }}
      >
        Delete
      </Button>
    </div>
  );
}
