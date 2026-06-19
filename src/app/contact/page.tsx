"use client";

import { useActionState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { submitContact } from "@/lib/actions/booking";

export default function ContactPage() {
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
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Have a project in mind? Reach out and our team will get back to you
            within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="mt-3 text-slate-600">
              Whether you need a quick consultation or a full campaign strategy,
              we are here to help.
            </p>
            <ul className="mt-8 space-y-5">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 text-amber-500" size={20} />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-slate-600">hello@biart.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 text-amber-500" size={20} />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-slate-600">+1 (555) 123-4567</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-amber-500" size={20} />
                <div>
                  <p className="font-medium">Office</p>
                  <p className="text-sm text-slate-600">
                    123 Creative Avenue, Business District
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            {state?.success ? (
              <div className="py-12 text-center">
                <p className="text-lg font-semibold text-green-600">
                  Message sent successfully!
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  We will get back to you shortly.
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
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
