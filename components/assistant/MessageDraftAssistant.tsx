"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clipboard, LoaderCircle, MessageSquareText, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  messageDraftsService,
  type MessageDraftTone,
  type MessageDraftTarget,
  type MessageDraftTargets,
  type MessageDraftType,
} from "@/services/message-drafts.service";

const DRAFT_TYPE_OPTIONS: {
  value: MessageDraftType;
  label: string;
  description: string;
}[] = [
  {
    value: "enquiry",
    label: "Enquiry reply",
    description: "Reply to an active enquiry using their requested programme and status.",
  },
  {
    value: "fee",
    label: "Fee notification",
    description: "Prepare a clear fee-due reminder using the selected due record.",
  },
  {
    value: "birthday",
    label: "Birthday wish",
    description: "Write a warm birthday wish for a student celebrating today.",
  },
];

const TONES: MessageDraftTone[] = ["Warm", "Professional", "Friendly"];

function targetLabel(target: MessageDraftTarget): string {
  return `${target.label} - ${target.detail}`;
}

export default function MessageDraftAssistant() {
  const [targets, setTargets] = useState<MessageDraftTargets | null>(null);
  const [draftType, setDraftType] = useState<MessageDraftType>("enquiry");
  const [recordId, setRecordId] = useState("");
  const [tone, setTone] = useState<MessageDraftTone>("Warm");
  const [instructions, setInstructions] = useState("");
  const [draft, setDraft] = useState("");
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTargets = useMemo(
    () => targets?.[draftType] ?? [],
    [draftType, targets]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextTargets, configured] = await Promise.all([
        messageDraftsService.getTargets(),
        messageDraftsService.getStatus(),
      ]);
      setTargets(nextTargets);
      setIsConfigured(configured);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load message draft options.";
      setError(message);
      setTargets(null);
      setIsConfigured(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function generateDraft() {
    const parsedRecordId = Number(recordId);

    if (!Number.isInteger(parsedRecordId) || parsedRecordId <= 0) {
      setError("Select a record before generating a draft.");
      return;
    }

    if (instructions.trim().length > 500) {
      setError("Additional guidance must be 500 characters or fewer.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const nextDraft = await messageDraftsService.generate({
        draftType,
        recordId: parsedRecordId,
        tone,
        instructions: instructions.trim(),
      });
      setDraft(nextDraft);
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : "Unable to generate a message draft.";
      setError(message);
      setDraft("");
    } finally {
      setGenerating(false);
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("Draft copied. Review and send it manually.");
    } catch {
      setError("Unable to copy the draft. Select the text and copy it manually.");
    }
  }

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6" aria-labelledby="message-draft-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h2 id="message-draft-title" className="font-semibold">
              Message draft assistant
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a draft from a staff-visible record, then review, copy, and send it yourself.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading || generating}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh options
        </Button>
      </div>

      <Alert className="mt-5 border-amber-200 bg-amber-50 text-amber-950">
        <Sparkles />
        <AlertTitle>Drafts only</AlertTitle>
        <AlertDescription>
          This assistant never sends messages or changes enquiries, student records, or payments.
        </AlertDescription>
      </Alert>

      {isConfigured === false && (
        <Alert className="mt-4" role="status">
          <AlertTitle>AI generation needs configuration</AlertTitle>
          <AlertDescription>
            Add the server-side OpenAI key to the Supabase Edge Function, then refresh this page. No draft has been created.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Message draft unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading staff-visible message options...
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="draft-type" className="text-sm font-medium">
                Draft type
              </label>
              <select
                id="draft-type"
                value={draftType}
                onChange={(event) => {
                  setDraftType(event.target.value as MessageDraftType);
                  setRecordId("");
                  setDraft("");
                }}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {DRAFT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {DRAFT_TYPE_OPTIONS.find((option) => option.value === draftType)?.description}
              </p>
            </div>

            <div>
              <label htmlFor="draft-record" className="text-sm font-medium">
                Record
              </label>
              <select
                id="draft-record"
                value={recordId}
                onChange={(event) => setRecordId(event.target.value)}
                disabled={selectedTargets.length === 0}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {selectedTargets.length > 0 ? "Select a record" : "No matching records available"}
                </option>
                {selectedTargets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {targetLabel(target)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="draft-tone" className="text-sm font-medium">
                Tone
              </label>
              <select
                id="draft-tone"
                value={tone}
                onChange={(event) => setTone(event.target.value as MessageDraftTone)}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {TONES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="draft-guidance" className="text-sm font-medium">
                Additional guidance <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="draft-guidance"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                maxLength={500}
                placeholder="Example: Mention that weekday evening batches are available."
                className="mt-1 min-h-24"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{instructions.length}/500</p>
            </div>

            <Button
              onClick={() => void generateDraft()}
              disabled={
                generating ||
                isConfigured !== true ||
                !recordId ||
                selectedTargets.length === 0
              }
              className="w-full sm:w-auto"
            >
              {generating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating draft..." : "Generate draft"}
            </Button>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Review before sending</h3>
              {draft && (
                <Button variant="outline" size="sm" onClick={() => void copyDraft()}>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy draft
                </Button>
              )}
            </div>
            {draft ? (
              <Textarea
                aria-label="Generated message draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="mt-3 min-h-64 bg-background"
              />
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your generated message will appear here. You can edit it before copying it to the channel you use to send messages.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
