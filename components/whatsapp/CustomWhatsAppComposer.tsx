"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  communicationRecipientService,
  type CommunicationRecipient,
} from "@/services/communication-recipient.service";
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
      "Hi {name}, this is a friendly reminder about your {program} class at Footloose Alley Dance & Fitness Studio. We look forward to seeing you!",
  },
  {
    label: "We missed you",
    category: "Attendance",
    message:
      "Hi {name}, we missed you at Footloose Alley! We hope everything is well and would love to see you back in your {program} class soon.",
  },
  {
    label: "Payment reminder",
    category: "Fee Due",
    message:
      "Hi {name}, this is a gentle reminder regarding your pending membership payment at Footloose Alley. Please let us know if you need any assistance.",
  },
  {
    label: "Membership renewal",
    category: "Renewal",
    message:
      "Hi {name}, your Footloose Alley membership is due for renewal. Renew now to continue your {program} classes without interruption. Please reply and we will assist you.",
  },
  {
    label: "Trial invitation",
    category: "Trial",
    message:
      "Hi {name}, thank you for your interest in {program} at Footloose Alley Dance & Fitness Studio. We would be happy to help you book a trial class.",
  },
  {
    label: "Birthday wish",
    category: "Birthday",
    message:
      "Happy Birthday, {name}! 🎉 The entire Footloose Alley family wishes you a wonderful year filled with happiness, health, dance, and fitness. Have an amazing day!",
  },
  {
    label: "Welcome message",
    category: "Custom",
    message:
      "Hi {name}, welcome to Footloose Alley Dance & Fitness Studio! We are excited to have you join our {program} classes. Please reach out whenever you need assistance.",
  },
  {
    label: "Event invitation",
    category: "Custom",
    message:
      "Hi {name}, Footloose Alley has an exciting upcoming event and we would love for you to join us! Reply to this message for complete details and registration.",
  },
];

function firstName(value: string): string {
  return value.trim().split(/\s+/)[0] || "there";
}

function applyRecipientTokens(
  template: string,
  name: string,
  program: string
): string {
  return template
    .replaceAll("{name}", firstName(name))
    .replaceAll("{program}", program.trim() || "class");
}

export default function CustomWhatsAppComposer() {
  const [recipients, setRecipients] = useState<CommunicationRecipient[]>([]);
  const [recipientLoading, setRecipientLoading] = useState(true);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<CommunicationRecipient | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [program, setProgram] = useState("");
  const [category, setCategory] = useState<WhatsAppMessageCategory>("Custom");
  const [message, setMessage] = useState("");
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let active = true;

    communicationRecipientService
      .getRecipients()
      .then((result) => {
        if (active) setRecipients(result);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load students and enquiries."
        );
      })
      .finally(() => {
        if (active) setRecipientLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const validPhone = useMemo(() => isValidWhatsAppPhone(phone), [phone]);

  const filteredRecipients = useMemo(() => {
    const query = recipientSearch.trim().toLowerCase();
    if (query.length < 2 || selectedRecipient) return [];

    return recipients
      .filter((recipient) =>
        [
          recipient.name,
          recipient.phone,
          recipient.program,
          recipient.batch,
          recipient.status,
          recipient.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 8);
  }, [recipientSearch, recipients, selectedRecipient]);

  function selectRecipient(recipient: CommunicationRecipient) {
    setSelectedRecipient(recipient);
    setRecipientSearch(recipient.name);
    setName(recipient.name);
    setPhone(recipient.phone);
    setProgram(recipient.program);
  }

  function clearRecipient() {
    setSelectedRecipient(null);
    setRecipientSearch("");
    setName("");
    setPhone("");
    setProgram("");
  }

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setCategory(template.category);
    setMessage(applyRecipientTokens(template.message, name, program));
  }

  async function openWhatsApp() {
    const recipientName = name.trim();
    const recipientPhone = phone.trim();
    const finalMessage = message.trim();

    if (!recipientName) {
      toast.error("Enter or select the recipient name.");
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
      recipientType: selectedRecipient?.type ?? "Student",
      recipientId: selectedRecipient?.id ?? 0,
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
      clearRecipient();
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
            <p className="text-sm font-semibold">Smart quick message</p>
          </div>
          <h2 className="mt-1 text-xl font-bold">WhatsApp Composer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search students or enquiries, automatically fill their details, and choose a ready message.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-5">
        <label className="mb-1.5 block text-sm font-medium">
          Find a student or enquiry
        </label>
        <div className="relative">
          {recipientLoading ? (
            <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            value={recipientSearch}
            onChange={(event) => {
              setRecipientSearch(event.target.value);
              if (selectedRecipient) setSelectedRecipient(null);
            }}
            placeholder="Search by name, phone, program or batch"
            className="pl-9 pr-10"
          />
          {(recipientSearch || selectedRecipient) && (
            <button
              type="button"
              onClick={clearRecipient}
              aria-label="Clear selected recipient"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filteredRecipients.length > 0 && (
          <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-background p-1 shadow-xl">
            {filteredRecipients.map((recipient) => (
              <button
                key={recipient.key}
                type="button"
                onClick={() => selectRecipient(recipient)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-muted"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{recipient.name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {recipient.type}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[recipient.phone || "No phone", recipient.program, recipient.batch]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedRecipient && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-700" />
              <p className="font-semibold text-green-900">{selectedRecipient.name}</p>
            </div>
            <p className="mt-1 text-sm text-green-800">
              {[
                selectedRecipient.type,
                selectedRecipient.phone || "No phone number",
                selectedRecipient.program,
                selectedRecipient.batch,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-800 shadow-sm">
            Details filled automatically
          </span>
        </div>
      )}

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
        <label className="mb-2 block text-sm font-medium">Saved templates</label>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => applyTemplate(template)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
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
          placeholder="Select a template or type your message here..."
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
