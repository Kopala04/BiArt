"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { createBooking } from "@/lib/actions/booking";
import { TIME_SLOTS } from "@/lib/constants";
import { formatPrice, parseServices } from "@/lib/utils";

type Package = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  services: string;
};

type ContactDetails = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
  notes: string;
};

function BookingFlow({ packages }: { packages: Package[] }) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("package");
  const initialPackage =
    packages.find((p) => p.slug === preselected) || packages[0];

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(
    initialPackage || null
  );
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [contact, setContact] = useState<ContactDetails>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    company: "",
    notes: "",
  });
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createBooking(formData),
    null
  );

  const minDate = format(new Date(), "yyyy-MM-dd");

  if (state?.success && state.booking) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <CheckCircle className="mx-auto text-green-500" size={64} />
          <h1 className="mt-6 text-3xl font-bold">Booking Confirmed!</h1>
          <p className="mt-3 text-slate-600">
            Thank you, {state.booking.clientName}. Your appointment has been
            scheduled. A confirmation has been sent to{" "}
            {state.booking.clientEmail}.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
            <p className="text-sm text-slate-500">Package</p>
            <p className="font-semibold">{state.booking.packageName}</p>
            <p className="mt-3 text-sm text-slate-500">Date & Time</p>
            <p className="font-semibold">
              {format(new Date(state.booking.date), "MMMM d, yyyy")} at{" "}
              {state.booking.timeSlot}
            </p>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            <Link href="/register" className="font-medium text-amber-600 hover:underline">
              Create a client account
            </Link>{" "}
            to track your bookings and package details.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="bg-slate-950 py-12 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold">Book an Appointment</h1>
          <p className="mt-2 text-slate-300">
            Simple 4-step booking — select a package, pick a time, and confirm.
          </p>
          <div className="mt-8 flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step >= s
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-0.5 flex-1 ${step > s ? "bg-amber-500" : "bg-slate-700"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold">Select a Package</h2>
              <div className="mt-6 space-y-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`w-full rounded-2xl border p-6 text-left transition ${
                      selectedPackage?.id === pkg.id
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <span className="font-bold text-amber-600">
                        {formatPrice(pkg.price)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button disabled={!selectedPackage} onClick={() => setStep(2)}>
                  Continue
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedPackage && (
            <div>
              <h2 className="text-xl font-semibold">Choose Date & Time</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={minDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Available Time Slots *</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`rounded-lg border px-3 py-2 text-sm transition ${
                          timeSlot === slot
                            ? "border-amber-400 bg-amber-50 font-medium"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button disabled={!date || !timeSlot} onClick={() => setStep(3)}>
                  Continue <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && selectedPackage && (
            <div>
              <h2 className="text-xl font-semibold">Your Contact Details</h2>
              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      value={contact.clientName}
                      onChange={(e) =>
                        setContact({ ...contact, clientName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={contact.clientEmail}
                      onChange={(e) =>
                        setContact({ ...contact, clientEmail: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="clientPhone">Phone *</Label>
                    <Input
                      id="clientPhone"
                      value={contact.clientPhone}
                      onChange={(e) =>
                        setContact({ ...contact, clientPhone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={contact.company}
                      onChange={(e) =>
                        setContact({ ...contact, company: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={contact.notes}
                    onChange={(e) =>
                      setContact({ ...contact, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button
                  disabled={
                    !contact.clientName ||
                    !contact.clientEmail ||
                    !contact.clientPhone
                  }
                  onClick={() => setStep(4)}
                >
                  Review Booking <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && selectedPackage && (
            <div>
              <h2 className="text-xl font-semibold">Confirm Your Booking</h2>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">{selectedPackage.name}</h3>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPrice(selectedPackage.price)}
                </p>
                <ul className="mt-4 space-y-1 text-sm text-slate-600">
                  {parseServices(selectedPackage.services).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
                <hr className="my-4 border-slate-100" />
                <p className="text-sm">
                  <span className="text-slate-500">Date:</span>{" "}
                  {date && format(new Date(date), "MMMM d, yyyy")}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">Time:</span> {timeSlot}
                </p>
                <p className="mt-2 text-sm">
                  <span className="text-slate-500">Contact:</span>{" "}
                  {contact.clientName} ({contact.clientEmail})
                </p>
              </div>

              <form action={action} className="mt-6">
                <input type="hidden" name="packageId" value={selectedPackage.id} />
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="timeSlot" value={timeSlot} />
                <input type="hidden" name="clientName" value={contact.clientName} />
                <input type="hidden" name="clientEmail" value={contact.clientEmail} />
                <input type="hidden" name="clientPhone" value={contact.clientPhone} />
                <input type="hidden" name="company" value={contact.company} />
                <input type="hidden" name="notes" value={contact.notes} />
                {state?.error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                  </p>
                )}
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Confirming..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

export default function BookPageWrapper({
  packages,
}: {
  packages: Package[];
}) {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <BookingFlow packages={packages} />
    </Suspense>
  );
}
