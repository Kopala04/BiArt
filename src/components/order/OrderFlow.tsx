"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useCallback, useMemo, useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { createOrder } from "@/lib/actions/order";
import { formatPrice } from "@/lib/utils";
import { useT, useLocale } from "@/components/i18n/LanguageProvider";
import { fill } from "@/lib/i18n";

type OrderService = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  description: string;
};

type OrderPrintProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  maxQuantity: number;
  unit: string;
  categorySlug: string;
  categoryName: string;
};

type LoggedInContact = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
};

type ContactDetails = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
  notes: string;
};

function OrderFlow({
  services,
  printProducts,
  loggedInContact,
}: {
  services: OrderService[];
  printProducts: OrderPrintProduct[];
  loggedInContact: LoggedInContact | null;
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const productSlug = searchParams.get("product");

  const preselectedService =
    serviceSlug ? services.find((s) => s.slug === serviceSlug) ?? null : null;
  const preselectedProduct =
    productSlug ? printProducts.find((p) => p.slug === productSlug) ?? null : null;

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<OrderService | null>(
    () => preselectedService
  );
  const [selectedProduct, setSelectedProduct] = useState<OrderPrintProduct | null>(
    () => preselectedProduct
  );
  const [quantity, setQuantity] = useState(1);
  const [contact, setContact] = useState<ContactDetails>(() => ({
    clientName: loggedInContact?.clientName ?? "",
    clientEmail: loggedInContact?.clientEmail ?? "",
    clientPhone: loggedInContact?.clientPhone ?? "",
    company: loggedInContact?.company ?? "",
    notes: "",
  }));
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createOrder(formData),
    null
  );

  const selectionLocked = !!(preselectedService || preselectedProduct);
  const isPrint = !!selectedProduct;
  const maxQty = selectedProduct?.maxQuantity ?? 1;

  const formatItemPrice = useCallback(
    (price: number | null | undefined) => {
      if (price === null || price === undefined) return t.common.quote;
      if (price === 0) return t.common.free;
      return formatPrice(price, locale);
    },
    [locale, t.common.free, t.common.quote]
  );

  const selectionSummary = useMemo(() => {
    if (selectedProduct) {
      const lineTotal = selectedProduct.price * quantity;
      return {
        name: selectedProduct.name,
        price: formatPrice(lineTotal, locale),
        unitPrice: formatPrice(selectedProduct.price, locale),
        description: selectedProduct.description,
        quantity,
        maxQuantity: selectedProduct.maxQuantity,
      };
    }
    if (selectedService) {
      return {
        name: selectedService.title,
        price: formatItemPrice(selectedService.price),
        unitPrice: null,
        description: selectedService.description,
        quantity: 1,
        maxQuantity: 1,
      };
    }
    return null;
  }, [selectedProduct, selectedService, quantity, locale, formatItemPrice]);

  const hasSelection = !!selectionSummary;
  const totalSteps = 3;

  const continueFromPick = () => {
    if (!selectedService && !selectedProduct) return;
    setStep(2);
  };

  if (state && "success" in state && state.success && state.order) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <CheckCircle className="mx-auto text-green-500" size={64} />
          <h1 className="mt-6 text-3xl font-bold">{t.order.confirmedTitle}</h1>
          <p className="mt-3 text-slate-600">
            {fill(t.order.confirmedThanks, {
              name: state.order.clientName,
              email: state.order.clientEmail,
            })}
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {state.order.orderType === "print"
                ? t.order.printProduct
                : t.order.service}
            </p>
            <p className="mt-1 font-semibold">{state.order.itemName}</p>
            {state.order.quantity > 1 && (
              <p className="mt-1 text-sm text-slate-600">
                {fill(t.order.quantityLabel, { count: String(state.order.quantity) })}
              </p>
            )}
          </div>
          <p className="mt-6 text-sm text-slate-500">{t.order.confirmedNote}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button variant="outline">{t.nav.home}</Button>
            </Link>
            <Link href="/dashboard">
              <Button>{t.profile.goToDashboard}</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="page-hero py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold">{t.order.heroTitle}</h1>
          <p className="mt-2 text-slate-300">{t.order.heroSubtitle}</p>
          <div
            className="mt-6 flex gap-2 overflow-x-auto pb-2 sm:mt-8 sm:justify-between"
            aria-label={t.order.heroTitle}
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
          {step === 1 && !hasSelection && (
            <div>
              <h2 className="text-xl font-semibold">{t.order.pickTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.order.pickSubtitle}</p>
              {services.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                    {t.order.servicesSection}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedProduct(null);
                          setQuantity(1);
                        }}
                        className={`rounded-xl border p-4 text-left transition hover:border-amber-400 hover:shadow-md ${
                          selectedService?.id === service.id
                            ? "border-amber-400 bg-amber-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{service.title}</p>
                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold text-amber-600">
                            {formatItemPrice(service.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {printProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                    {t.order.printSection}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {printProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedService(null);
                          setQuantity(1);
                        }}
                        className={`rounded-xl border p-4 text-left transition hover:border-amber-400 hover:shadow-md ${
                          selectedProduct?.id === product.id
                            ? "border-amber-400 bg-amber-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs text-slate-500">{product.categoryName}</p>
                            <p className="font-semibold">{product.name}</p>
                          </div>
                          <p className="shrink-0 font-semibold text-amber-600">
                            {formatPrice(product.price, locale)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-end">
                <Button disabled={!hasSelection} onClick={continueFromPick}>
                  {t.common.continue} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && hasSelection && selectionSummary && (
            <div>
              <h2 className="text-xl font-semibold">{t.order.reviewItemTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.order.reviewItemSubtitle}</p>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">{selectionSummary.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{selectionSummary.description}</p>
                {isPrint && (
                  <div className="mt-6">
                    <Label>{t.order.quantity}</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label={t.order.decreaseQty}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="min-w-[2rem] text-center text-lg font-semibold">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={quantity >= maxQty}
                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                        aria-label={t.order.increaseQty}
                      >
                        <Plus size={16} />
                      </Button>
                      {selectedProduct?.unit && (
                        <span className="text-sm text-slate-500">{selectedProduct.unit}</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {fill(t.order.maxPerOrder, { count: String(maxQty) })}
                    </p>
                    {quantity >= maxQty && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {t.order.needMoreBulk}{" "}
                        <Link href="/packages" className="font-medium underline">
                          {t.order.viewPackages}
                        </Link>
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-6 text-2xl font-bold text-amber-600">
                  {isPrint
                    ? selectionSummary.price
                    : selectionSummary.price}
                </p>
                {isPrint && quantity > 1 && (
                  <p className="text-xs text-slate-500">
                    {fill(t.order.unitPrice, { price: selectionSummary.unitPrice ?? "" })}
                  </p>
                )}
              </div>
              <div className="mt-8 flex justify-between">
                {!selectionLocked && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedService(null);
                      setSelectedProduct(null);
                      setQuantity(1);
                    }}
                  >
                    <ChevronLeft size={16} /> {t.common.back}
                  </Button>
                )}
                {selectionLocked && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      router.push(
                        isPrint
                          ? `/print/${selectedProduct?.categorySlug}`
                          : "/services"
                      )
                    }
                  >
                    <ChevronLeft size={16} /> {t.common.back}
                  </Button>
                )}
                <Button onClick={() => setStep(2)}>
                  {t.common.continue} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && hasSelection && (
            <div>
              <h2 className="text-xl font-semibold">{t.order.contactTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.order.contactSubtitle}</p>
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
                <div>
                  <Label htmlFor="notes">{t.booking.additionalNotes}</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={contact.notes}
                    onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                    placeholder={t.order.notesPlaceholder}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> {t.common.back}
                </Button>
                <Button
                  disabled={
                    !contact.clientName || !contact.clientEmail || !contact.clientPhone
                  }
                  onClick={() => setStep(3)}
                >
                  {t.order.reviewOrder} <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && hasSelection && selectionSummary && (
            <div>
              <h2 className="text-xl font-semibold">{t.order.confirmTitle}</h2>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {isPrint ? t.order.printProduct : t.order.service}
                </p>
                <h3 className="mt-1 font-semibold">{selectionSummary.name}</h3>
                {isPrint && quantity > 1 && (
                  <p className="mt-1 text-sm text-slate-600">
                    {fill(t.order.quantityLabel, { count: String(quantity) })}
                  </p>
                )}
                <p className="mt-3 text-2xl font-bold text-amber-600">
                  {selectionSummary.price}
                </p>
                <hr className="my-4 border-slate-100" />
                <p className="text-sm">
                  <span className="text-slate-500">{t.booking.contactLabel}</span>{" "}
                  {contact.clientName} ({contact.clientEmail})
                </p>
              </div>

              <form action={action} className="mt-6">
                {selectedService && (
                  <input type="hidden" name="serviceId" value={selectedService.id} />
                )}
                {selectedProduct && (
                  <input type="hidden" name="printProductId" value={selectedProduct.id} />
                )}
                <input type="hidden" name="quantity" value={quantity} />
                <input type="hidden" name="clientName" value={contact.clientName} />
                <input type="hidden" name="clientEmail" value={contact.clientEmail} />
                <input type="hidden" name="clientPhone" value={contact.clientPhone} />
                <input type="hidden" name="company" value={contact.company} />
                <input type="hidden" name="notes" value={contact.notes} />
                {state && "error" in state && state.error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                  </p>
                )}
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                    <ChevronLeft size={16} /> {t.common.back}
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? t.order.placing : t.order.placeOrder}
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

export default function OrderPageWrapper({
  services,
  printProducts,
  loggedInContact,
}: {
  services: OrderService[];
  printProducts: OrderPrintProduct[];
  loggedInContact: LoggedInContact | null;
}) {
  const t = useT();
  return (
    <Suspense fallback={<div className="py-24 text-center">{t.common.loading}</div>}>
      <OrderFlow
        services={services}
        printProducts={printProducts}
        loggedInContact={loggedInContact}
      />
    </Suspense>
  );
}
