"use client";

import { useRouter } from "next/navigation";
import { deleteBooking, updateBookingStatus } from "@/lib/actions/booking";
import { BOOKING_STATUS_VALUES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/LanguageProvider";

export function BookingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const t = useT();
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
        {BOOKING_STATUS_VALUES.map((s) => (
          <option key={s} value={s}>
            {t.statuses[s]}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="danger"
        onClick={async () => {
          if (confirm(t.admin.bookings.confirmDelete)) {
            await deleteBooking(id);
            router.refresh();
          }
        }}
      >
        {t.admin.bookings.delete}
      </Button>
    </div>
  );
}
