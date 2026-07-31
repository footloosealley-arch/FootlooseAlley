"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getWhatsAppUrl,
  isValidWhatsAppPhone,
  whatsappService,
  type WhatsAppMessageCategory,
  type WhatsAppQueueItem,
} from "@/services/whatsapp.service";

const TEMPLATES: Array<{
  label: string;
  category: WhatsAppMessageCategory;
  message: string;
}> = [
  {
    label: "Class reminder",
    category: "Custom",
    message:
      "Hi {name}, this is a friendly reminder about your class at Footloose Alley Dance & Fitness Studio. We look forward to seeing you!",
  },
  {
    label: "We missed you",
    category: "Attendance",
    message:
      "Hi {name}, we missed you at Footloose Alley! We hope everything is well and would love to see you back in class soon.",
  },
  {
    label: "Payment reminder",
    category: "Fee Due",
    message:
      "Hi {name}, this is a gentle reminder regarding your pending membership payment at Footloose Alley. Please let us know if you need any assistance.",
  },
  {
    label: "Trial invitation",
    category: "Trial",
    message:
      "Hi {name}, thank you for your interest in Footloose Alley Dance & Fitness Studio. We would be happy to help you book a trial class.",
  },
];

function firstName(value: string): string {
  return value.trim().split(/\s+/)[0] || "there";
}

export default function CustomWhatsAppComposer() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<WhatsAppMessageCategory>("Custom");
  const [message, setMessage] = useState("");
  const [opening, setOpening] = useState(false);

  const validPhone = useMemo(() => isValidWhatsAppPhone(phone), [phone]);

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setCategory(template.category);
    setMessage(template.message.replaceAll("{name}", firstName(name)));
  }

  async function openWhatsApp() {
    const recipientName = name.trim();
    const recipientPhone = phone.trim();
    const finalMessage = message.trim();

    if (!recipientName) {
      toast.error("Enter the recipient name.");
      return;
    }

    if (!validPhone) {
      toast.error("Enter a valid 10-digit Indian phone number.");
      return;
    }

    if (!finalMessage) {
      toast.error("Enter a message before opening WhatsApp.");
      return;
    }

    setOpening(true);

    const popup = window.open(
      getWhatsAppUrl(recipientPhone, finalMessage),
      "_blank",
      "noopener,noreferrer"
    );

    if (!popup) {
      toast.error("WhatsApp was blocked. Please allow pop-ups and try again.");
      setOpening(false);
      return;
    }

    const logItem: WhatsAppQueueItem = {
      id: `custom-${Date.now()}`,
      recipientType: "Student",
      recipientId: 0,
      name: recipientName,
      phone: recipientPhone,
      validPhone: true,
      category,
      priority: "Today",
      reason: "Custom message",
      template: finalMessage,
      actionDate: null,
    };

    try {
      await whatsappService.logCommunication(logItem, finalMessage);
      toast.success("Opened in WhatsApp and added to communication history.");
      setName("");
      setPhone("");
      setCategory("Custom");
      setMessage("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "WhatsApp opened, but the communication log could not be saved."
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-green-700">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-semibold">Quick message</p>
          </div>
          <h2 className="mt-1 text-xl font-bold">Custom WhatsApp Composer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send a personalised message even when the recipient is not in today&apos;s reminder queue.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Recipient name</label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Student or enquiry name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">WhatsApp number</label>
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="10-digit mobile number"
            inputMode="tel"
          />
          {phone && !validPhone && (
            <p className="mt-1 text-xs text-red-600">Enter a valid Indian mobile number.</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Quick templates</label>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => applyTemplate(template)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium">Message</label>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message here..."
          className="min-h-36"
          maxLength={1200}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>The message can be edited again inside WhatsApp.</span>
          <span>{message.length}/1200</span>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          onClick={() => void openWhatsApp()}
          disabled={opening || !name.trim() || !validPhone || !message.trim()}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Send className="h-4 w-4" />
          {opening ? "Opening..." : "Open in WhatsApp"}
        </Button>
      </div>
    </section>
  );
}
