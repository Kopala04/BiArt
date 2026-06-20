"use client";

import { useActionState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { submitContact } from "@/lib/actions/booking";
import { useT } from "@/components/i18n/LanguageProvider";

export default function ContactPage() {
  const t = useT();
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return submitContact(formData);
    },
    null
  );

  return (
    <PublicLayout>
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">{t.contact.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold">{t.contact.getInTouch}</h2>
            <p className="mt-3 text-slate-600">{t.contact.getInTouchSub}</p>
            <ul className="mt-8 space-y-5">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 text-amber-500" size={20} />
                <div>
                  <p className="font-medium">{t.contact.emailLabel}</p>
                  <p className="text-sm text-slate-600">{t.footer.email}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 text-amber-500" size={20} />
                <div>
                  <p className="font-medium">{t.contact.phoneLabel}</p>
                  <p className="text-sm text-slate-600">{t.footer.phone}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-amber-500" size={20} />
                <div>
                  <p className="font-medium">{t.contact.officeLabel}</p>
                  <p className="text-sm text-slate-600">{t.footer.address}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            {state?.success ? (
              <div className="py-12 text-center">
                <p className="text-lg font-semibold text-green-600">
                  {t.contact.successTitle}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {t.contact.successSub}
                </p>
              </div>
            ) : (
              <form action={action} className="space-y-5">
                {state?.error && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">{t.contact.name} *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.contact.emailLabel} *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">{t.contact.phoneLabel}</Label>
                    <Input id="phone" name="phone" />
                  </div>
                  <div>
                    <Label htmlFor="company">{t.contact.company}</Label>
                    <Input id="company" name="company" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">{t.contact.subject}</Label>
                  <Input id="subject" name="subject" />
                </div>
                <div>
                  <Label htmlFor="message">{t.contact.message} *</Label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? t.contact.sending : t.contact.send}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
