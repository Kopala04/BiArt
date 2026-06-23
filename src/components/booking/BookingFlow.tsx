"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Rocket,
  CalendarDays,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { createBooking } from "@/lib/actions/booking";
import { CONSULTATION_CREDIT_TIME_SLOT, TIME_SLOTS } from "@/lib/constants";
import { formatPrice, parseServices, formatDate, formatTimeSlot } from "@/lib/utils";
import { useT, useLocale } from "@/components/i18n/LanguageProvider";
import { fill } from "@/lib/i18n";

type Package = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  services: string;
};

type ConsultationService = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  description: string;
};

type UpgradePath = "start" | "kickoff" | null;

type ConsultationCreditInfo = {
  id: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string | null;
};

type ContactDetails = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
  notes: string;
};

function emailsMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

type LoggedInContact = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
};

function BookingFlow({
  packages,
  consultationService,
  consultationCredit,
  upgradeMode,
  loggedInContact,
}: {
  packages: Package[];
  consultationService: ConsultationService | null;
  consultationCredit: ConsultationCreditInfo | null;
  upgradeMode: boolean;
  loggedInContact: LoggedInContact | null;
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageSlug = searchParams.get("package");
  const consultationMode = !!consultationService;

  const preselectedPackage =
    packageSlug ? packages.find((p) => p.slug === packageSlug) ?? null : null;
  const packageLocked = !!preselectedPackage;

  const contactStep = consultationMode ? 2 : 3;
  const confirmStep = consultationMode ? 3 : 4;
  const totalSteps = consultationMode ? 3 : 4;

  const initialStep = consultationMode
    ? 1
    : preselectedPackage
      ? 2
      : 1;

  const [step, setStep] = useState(initialStep);
  const [upgradePath, setUpgradePath] = useState<UpgradePath>(null);
  const [schedulingSkipped, setSchedulingSkipped] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(
    () => preselectedPackage
  );
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [contact, setContact] = useState<ContactDetails>(() => ({
    clientName:
      consultationCredit?.clientName ?? loggedInContact?.clientName ?? "",
    clientEmail:
      consultationCredit?.clientEmail ?? loggedInContact?.clientEmail ?? "",
    clientPhone:
      consultationCredit?.clientPhone ?? loggedInContact?.clientPhone ?? "",
    company: consultationCredit?.company ?? loggedInContact?.company ?? "",
    notes: "",
  }));
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createBooking(formData),
    null
  );

  const minDate = format(new Date(), "yyyy-MM-dd");
  const hasSelection = consultationMode ? !!consultationService : !!selectedPackage;
  const isUpgradeFlow = !consultationMode && !!consultationCredit;
  const creditAppliesToContact =
    !!consultationCredit &&
    !!contact.clientEmail &&
    emailsMatch(consultationCredit.clientEmail, contact.clientEmail);
  const scheduleStep = consultationMode ? 1 : 2;
  const showUpgradeChoice =
    step === scheduleStep && isUpgradeFlow && upgradePath === null;
  const showDateTime =
    step === scheduleStep &&
    hasSelection &&
    (consultationMode || !isUpgradeFlow || upgradePath === "kickoff");

  const continueFromSelection = () => {
    setUpgradePath(null);
    setSchedulingSkipped(false);
    setStep(2);
  };

  const goBackFromDateTime = () => {
    if (upgradePath === "kickoff") {
      setUpgradePath(null);
      return;
    }
    if (consultationMode) {
      router.push("/services");
      return;
    }
    if (packageLocked) {
      router.push("/packages");
      return;
    }
    setStep(1);
  };

  const goBackFromContact = () => {
    if (upgradePath === "start") {
      setUpgradePath(null);
      setStep(scheduleStep);
      return;
    }
    setStep(scheduleStep);
  };

  const chooseStartWork = () => {
    if (!consultationCredit) return;
    setUpgradePath("start");
    setSchedulingSkipped(true);
    setDate(format(new Date(consultationCredit.date), "yyyy-MM-dd"));
    setTimeSlot(CONSULTATION_CREDIT_TIME_SLOT);
    setContact({
      clientName: consultationCredit.clientName,
      clientEmail: consultationCredit.clientEmail,
      clientPhone: consultationCredit.clientPhone,
      company: consultationCredit.company ?? "",
      notes: "",
    });
    setStep(contactStep);
  };

  const chooseKickoff = () => {
    if (!consultationCredit) return;
    setUpgradePath("kickoff");
    setSchedulingSkipped(false);
    setDate("");
    setTimeSlot("");
    setContact({
      clientName: consultationCredit.clientName,
      clientEmail: consultationCredit.clientEmail,
      clientPhone: consultationCredit.clientPhone,
      company: consultationCredit.company ?? "",
      notes: contact.notes,
    });
  };

  const selectionSummary = useMemo(() => {
    if (consultationMode && consultationService) {
      return {
        name: consultationService.title,
        price: consultationService.price === 0 ? t.common.free : t.common.free,
        description: consultationService.description,
        details: [] as string[],
        isConsultation: true,
      };
    }
    if (selectedPackage) {
      return {
        name: selectedPackage.name,
        price: formatPrice(selectedPackage.price, locale),
        description: selectedPackage.description,
        details: parseServices(selectedPackage.services),
        isConsultation: false,
      };
    }
    return null;
  }, [consultationMode, consultationService, selectedPackage, locale, t.common.free]);

  const bookingLabel =
    consultationMode && consultationService
      ? consultationService.title
      : selectedPackage?.name;

  if (state && "success" in state && state.success && state.booking) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <CheckCircle className="mx-auto text-green-500" size={64} />
          <h1 className="mt-6 text-3xl font-bold">{t.booking.confirmedTitle}</h1>
          <p className="mt-3 text-slate-600">
            {fill(t.booking.confirmedThanks, {
              name: state.booking.clientName,
              email: state.booking.clientEmail,
            })}
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
            <p className="text-sm text-slate-500">
              {state.booking.bookingType === "package"
                ? t.booking.package
                : t.booking.service}
            </p>
            <p className="font-semibold">{state.booking.itemName}</p>
            {state.booking.schedulingSkipped ? (
              <p className="mt-3 text-sm text-green-700">
                {t.booking.creditAppliedNote}
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm text-slate-500">{t.booking.dateAndTime}</p>
                <p className="font-semibold">
                  {formatDate(new Date(state.booking.date), "MMMM d, yyyy", locale)}{" "}
                  {t.booking.at}{" "}
                  {formatTimeSlot(state.booking.timeSlot, t.booking.creditApplied)}
                </p>
              </>
            )}
          </div>
          {state.booking.bookingType === "service" && (
            <p className="mt-6 text-sm text-slate-600">
              {t.booking.serviceUpsell}{" "}
              <Link
                href="/book?upgrade=true"
                className="font-medium text-amber-600 hover:underline"
              >
                {t.booking.serviceUpsellLink}
              </Link>
            </p>
          )}
          <p className="mt-6 text-sm text-slate-500">
            <Link
              href="/register"
              className="font-medium text-amber-600 hover:underline"
            >
              {t.booking.createAccountLink}
            </Link>{" "}
            {t.booking.createAccountSuffix}
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="page-hero py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold">
            {consultationMode ? t.booking.consultationTitle : t.booking.heroTitle}
          </h1>
          <p className="mt-2 text-slate-300">
            {consultationMode
              ? t.booking.consultationSubtitle
              : t.booking.heroSubtitle}
          </p>
          {consultationCredit && !consultationMode && (
            <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {fill(t.booking.creditBanner, {
                date: formatDate(
                  new Date(consultationCredit.date),
                  "MMMM d, yyyy",
                  locale
                ),
              })}
            </div>
          )}
          <div
            className="mt-6 flex gap-2 overflow-x-auto pb-2 sm:mt-8 sm:justify-between"
            aria-label={t.booking.heroTitle}
          >
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex shrink-0 items-center gap-1 sm:flex-1 sm:gap-2">
                <div
                  aria-current={step === s ? "step" : undefined}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:text-sm ${
                    step >= s
                      ? "bg-accent text-white dark:text-[#1f2622]"
                      : "bg-white/15 text-white/60"
                  }`}
                >
                  {s}
                </div>
                {s < totalSteps && (
                  <div
                    className={`hidden h-0.5 w-4 sm:block sm:flex-1 ${step > s ? "bg-accent" : "bg-white/15"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {!consultationMode && step === 1 && (
            <div>
              <h2 className="text-xl font-semibold">{t.booking.selectPackageTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {t.booking.selectPackageSubtitle}
              </p>
              <p className="mt-3 text-sm text-slate-500">{t.booking.individualOrderHint}</p>
              <div className="mt-6 space-y-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    aria-pressed={selectedPackage?.id === pkg.id}
                    className={`w-full rounded-2xl border p-6 text-left transition ${
                      selectedPackage?.id === pkg.id
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <span className="shrink-0 font-bold text-amber-600">
                        {formatPrice(pkg.price, locale)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => router.push("/packages")}>
                  <ChevronLeft size={16} /> {t.common.back}
                </Button>
                <Button disabled={!selectedPackage} onClick={continueFromSelection}>
                  {t.common.continue} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {showUpgradeChoice && (
            <div>
              <h2 className="text-xl font-semibold">{t.booking.upgradeChoiceTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {fill(t.booking.upgradeChoiceSubtitle, {
                  date: formatDate(
                    new Date(consultationCredit!.date),
                    "MMMM d, yyyy",
                    locale
                  ),
                })}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={chooseStartWork}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-amber-400 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Rocket size={24} aria-hidden />
                  </div>
                  <h3 className="font-semibold">{t.booking.startWorkTitle}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t.booking.startWorkText}</p>
                </button>
                <button
                  type="button"
                  onClick={chooseKickoff}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-amber-400 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <CalendarDays size={24} aria-hidden />
                  </div>
                  <h3 className="font-semibold">{t.booking.kickoffTitle}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t.booking.kickoffText}</p>
                </button>
              </div>
              <div className="mt-8">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> {t.common.back}
                </Button>
              </div>
            </div>
          )}

          {showDateTime && (
            <div>
              <h2 className="text-xl font-semibold">
                {upgradePath === "kickoff"
                  ? t.booking.scheduleKickoffTitle
                  : consultationMode
                    ? t.booking.consultationScheduleTitle
                    : t.booking.chooseDateTimeTitle}
              </h2>
              {upgradePath === "kickoff" && (
                <p className="mt-2 text-sm text-slate-600">{t.booking.kickoffNote}</p>
              )}
              {consultationMode && (
                <p className="mt-2 text-sm text-slate-600">
                  {t.booking.consultationScheduleSubtitle}
                </p>
              )}
              <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">
                <span className="text-slate-500">{t.booking.bookingLabel}</span>
                <span className="font-medium">{bookingLabel}</span>
              </div>
              <div className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="date">{t.booking.preferredDate} *</Label>
                  <DatePicker
                    id="date"
                    min={minDate}
                    value={date}
                    onChange={setDate}
                  />
                </div>
                <div>
                  <Label>{t.booking.availableTimeSlots} *</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        aria-pressed={timeSlot === slot}
                        className={`min-h-[44px] rounded-lg border px-2 py-2.5 text-sm transition active:scale-[0.98] ${
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
                <Button variant="ghost" onClick={goBackFromDateTime}>
                  <ChevronLeft size={16} /> {t.common.back}
                </Button>
                <Button
                  disabled={!date || !timeSlot}
                  onClick={() => setStep(contactStep)}
                >
                  {t.common.continue} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === contactStep && hasSelection && (
            <div>
              <h2 className="text-xl font-semibold">{t.booking.contactDetailsTitle}</h2>
              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="clientName">{t.booking.fullName} *</Label>
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
                    <Label htmlFor="clientEmail">{t.booking.email} *</Label>
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
                    <Label htmlFor="clientPhone">{t.booking.phone} *</Label>
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
                    <Label htmlFor="company">{t.booking.company}</Label>
                    <Input
                      id="company"
                      value={contact.company}
                      onChange={(e) =>
                        setContact({ ...contact, company: e.target.value })
                      }
                    />
                  </div>
                </div>
                {isUpgradeFlow &&
                  consultationCredit &&
                  contact.clientEmail &&
                  !creditAppliesToContact && (
                    <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {fill(t.booking.creditEmailMismatch, {
                        email: consultationCredit.clientEmail,
                      })}
                    </p>
                  )}
                <div>
                  <Label htmlFor="notes">{t.booking.additionalNotes}</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={contact.notes}
                    onChange={(e) =>
                      setContact({ ...contact, notes: e.target.value })
                    }
                    placeholder={t.booking.notesPlaceholderDefault}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={goBackFromContact}>
                  <ChevronLeft size={16} /> {t.common.back}
                </Button>
                <Button
                  disabled={
                    !contact.clientName ||
                    !contact.clientEmail ||
                    !contact.clientPhone
                  }
                  onClick={() => setStep(confirmStep)}
                >
                  {t.booking.reviewBooking} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === confirmStep && hasSelection && selectionSummary && (
            <div>
              <h2 className="text-xl font-semibold">{t.booking.confirmTitle}</h2>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {consultationMode
                    ? t.booking.individualService
                    : t.booking.servicePackage}
                </p>
                <h3 className="mt-1 font-semibold">{selectionSummary.name}</h3>
                {!consultationMode && (
                  <p className="text-2xl font-bold text-amber-600">
                    {selectionSummary.price}
                  </p>
                )}
                {consultationMode && (
                  <p className="text-2xl font-bold text-amber-600">{t.common.free}</p>
                )}
                <p className="mt-2 text-sm text-slate-600">
                  {selectionSummary.description}
                </p>
                {selectionSummary.details.length > 0 && (
                  <ul className="mt-4 space-y-1 text-sm text-slate-600">
                    {selectionSummary.details.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                )}
                <hr className="my-4 border-slate-100" />
                {schedulingSkipped && creditAppliesToContact ? (
                  <p className="text-sm text-green-700">{t.booking.creditApplied}</p>
                ) : schedulingSkipped && !creditAppliesToContact ? (
                  <p className="text-sm text-amber-700">
                    {t.booking.creditNotApplicableInline}
                  </p>
                ) : (
                  <>
                    <p className="text-sm">
                      <span className="text-slate-500">{t.booking.dateLabel}</span>{" "}
                      {date && formatDate(new Date(date), "MMMM d, yyyy", locale)}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500">{t.booking.timeLabel}</span>{" "}
                      {formatTimeSlot(timeSlot, t.booking.creditApplied)}
                    </p>
                  </>
                )}
                <p className="mt-2 text-sm">
                  <span className="text-slate-500">{t.booking.contactLabel}</span>{" "}
                  {contact.clientName} ({contact.clientEmail})
                </p>
              </div>

              <form action={action} className="mt-6">
                {!consultationMode && selectedPackage && (
                  <input type="hidden" name="packageId" value={selectedPackage.id} />
                )}
                {consultationMode && consultationService && (
                  <input type="hidden" name="serviceId" value={consultationService.id} />
                )}
                {creditAppliesToContact && consultationCredit && (
                  <input
                    type="hidden"
                    name="consultationBookingId"
                    value={consultationCredit.id}
                  />
                )}
                <input
                  type="hidden"
                  name="schedulingSkipped"
                  value={
                    schedulingSkipped && creditAppliesToContact ? "true" : "false"
                  }
                />
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="timeSlot" value={timeSlot} />
                <input type="hidden" name="clientName" value={contact.clientName} />
                <input type="hidden" name="clientEmail" value={contact.clientEmail} />
                <input type="hidden" name="clientPhone" value={contact.clientPhone} />
                <input type="hidden" name="company" value={contact.company} />
                <input type="hidden" name="notes" value={contact.notes} />
                {schedulingSkipped && !creditAppliesToContact && (
                  <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {fill(t.booking.creditNotApplicableWarn, {
                      email: contact.clientEmail,
                    })}
                  </p>
                )}
                {state && "error" in state && state.error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                  </p>
                )}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(contactStep)}
                  >
                    <ChevronLeft size={16} /> {t.common.back}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      pending ||
                      (schedulingSkipped &&
                        !creditAppliesToContact &&
                        (!date || !timeSlot))
                    }
                  >
                    {pending ? t.booking.confirming : t.booking.confirmBooking}
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
  consultationService,
  consultationCredit,
  upgradeMode,
  loggedInContact,
}: {
  packages: Package[];
  consultationService: ConsultationService | null;
  consultationCredit: ConsultationCreditInfo | null;
  upgradeMode: boolean;
  loggedInContact: LoggedInContact | null;
}) {
  const t = useT();
  return (
    <Suspense fallback={<div className="py-24 text-center">{t.common.loading}</div>}>
      <BookingFlow
        packages={packages}
        consultationService={consultationService}
        consultationCredit={consultationCredit}
        upgradeMode={upgradeMode}
        loggedInContact={loggedInContact}
      />
    </Suspense>
  );
}
