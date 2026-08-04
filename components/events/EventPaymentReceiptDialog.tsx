"use client";

import { Printer } from "lucide-react";
import { useState } from "react";

import BrandLogo from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EventRegistration } from "@/services/event-registrations.service";
import type { StudioEvent } from "@/services/events.service";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

export default function EventPaymentReceiptDialog({ registration, eventItem, open, onOpenChange }: { registration: EventRegistration | null; eventItem: StudioEvent | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [printError, setPrintError] = useState("");

  async function printReceipt() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) { setPrintError("Allow pop-ups for this site, then try again."); return; }
    const receipt = document.querySelector<HTMLElement>("#event-payment-receipt-print-root");
    if (!receipt) { printWindow.close(); setPrintError("The receipt could not be prepared."); return; }
    setPrintError("");
    const printDocument = printWindow.document;
    printDocument.title = `Event receipt ${registration?.receipt_number ?? ""}`.trim();
    printDocument.head.replaceChildren(); printDocument.body.replaceChildren();
    const base = printDocument.createElement("base"); base.href = new URL("/", document.baseURI).href; printDocument.head.append(base);
    const loads: Promise<void>[] = [];
    document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLLinkElement | HTMLStyleElement;
      if (clone instanceof HTMLLinkElement) loads.push(new Promise((resolve) => { clone.onload = () => resolve(); clone.onerror = () => resolve(); }));
      printDocument.head.append(clone);
    });
    const style = printDocument.createElement("style"); style.textContent = "@page{size:A4;margin:12mm}html,body{margin:0!important;background:white!important}#event-payment-receipt-print-root{max-width:none!important;border:0!important;box-shadow:none!important}*{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}"; printDocument.head.append(style);
    printDocument.body.append(receipt.cloneNode(true));
    const images = Array.from(printDocument.images, (image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); }));
    await Promise.all([...loads, ...images]);
    printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true }); printWindow.focus(); printWindow.print();
  }

  const names = registration ? [registration.participant_name, ...registration.additional_participant_names] : [];
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Event payment receipt</DialogTitle><DialogDescription>Print this receipt or save it as a PDF.</DialogDescription></DialogHeader>
    {registration && eventItem && <article id="event-payment-receipt-print-root" className="overflow-hidden rounded-sm border bg-white text-black shadow-sm"><header className="flex flex-col items-center gap-4 border-b-4 border-[#861d2d] p-6 sm:flex-row"><BrandLogo width={170} height={110} /><div className="text-center sm:border-l sm:pl-5 sm:text-left"><h2 className="text-2xl font-bold">Footloose Alley</h2><p className="font-semibold text-[#861d2d]">Dance and Fitness Studio</p><p className="mt-1 text-xs">Bengaluru · 8884978589</p></div></header><div className="p-6"><div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3"><h1 className="text-xl font-black tracking-wider text-[#861d2d]">EVENT RECEIPT</h1><strong className="font-mono">{registration.receipt_number}</strong></div><dl className="mt-4 grid gap-x-8 sm:grid-cols-2">{[["Event", eventItem.title], ["Event date", eventItem.event_date], ["Primary contact", registration.participant_name], ["Phone", registration.phone], ["Participants", String(registration.group_size)], ["Names", names.join(", ")], ["UPI reference", registration.payment_reference], ["Coupon", registration.coupon_code], ["Verified", registration.payment_verified_at ? new Date(registration.payment_verified_at).toLocaleString("en-IN") : null]].filter((entry) => entry[1]).map(([label, value]) => <div key={label} className="border-b py-2.5"><dt className="text-xs font-bold uppercase text-neutral-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>)}</dl><section className="my-5 flex items-center justify-between border-2 border-black p-4"><strong>AMOUNT RECEIVED</strong><strong className="text-2xl text-[#861d2d]">{money.format(Number(registration.amount_paid))}</strong></section><footer className="border-t pt-4 text-center text-xs text-neutral-600">This is a computer-generated event payment receipt.</footer></div></article>}
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button><Button type="button" onClick={() => void printReceipt()}><Printer /> Print / Save PDF</Button>{printError && <p role="alert" className="w-full text-sm text-destructive">{printError}</p>}</DialogFooter>
  </DialogContent></Dialog>;
}
