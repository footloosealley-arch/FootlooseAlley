"use client";

import {
  ClipboardList,
  Copy,
  ExternalLink,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const intakeForms = [
  {
    title: "Enquiry Form",
    description:
      "Share this with prospective students. New responses appear automatically in Enquiries.",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSerIJcVz-7dJZNLwIQIPB3nAwStOhen39Cu0LA7hdLf0eG8Kw/viewform",
    icon: ClipboardList,
    iconTone: "bg-blue-100 text-blue-700",
    shareMessage:
      "Interested in classes at Footloose Alley Dance and Fitness Studio? Please complete our enquiry form:",
  },
  {
    title: "Student Registration Form",
    description:
      "Share this after joining. Registrations wait for staff approval before becoming students.",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSe8njgMv7CE2pCBNEWfgUl8v2PgizVeLQ1Iq4ZiAre8NZAJTQ/viewform",
    icon: UserPlus,
    iconTone: "bg-emerald-100 text-emerald-700",
    shareMessage:
      "Welcome to Footloose Alley Dance and Fitness Studio! Please complete your student registration form and upload a clear photo:",
  },
] as const;

export default function PublicIntakeLinks() {
  async function copyLink(title: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${title} link copied.`);
    } catch {
      toast.error("Could not copy the form link. Please open the form and copy its address.");
    }
  }

  function openForm(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareOnWhatsApp(message: string, url: string) {
    const text = encodeURIComponent(`${message}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Public Forms
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open, copy, or share the official Footloose Alley intake forms.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {intakeForms.map((form) => {
          const Icon = form.icon;

          return (
            <article
              key={form.title}
              className="rounded-2xl border bg-background p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-xl p-3 ${form.iconTone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{form.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openForm(form.url)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyLink(form.title, form.url)}
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  type="button"
                  onClick={() => shareOnWhatsApp(form.shareMessage, form.url)}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
