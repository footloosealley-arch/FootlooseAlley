"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import PaymentReceipt from "@/components/payments/PaymentReceipt";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { PaymentWithStudent } from "@/types/database";

interface PaymentReceiptDialogProps {
  payment: PaymentWithStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentReceiptDialog({ payment, open, onOpenChange }: PaymentReceiptDialogProps) {
  const [printError, setPrintError] = useState<string | null>(null);

  const handlePrint = async () => {
    // Open immediately, while this function is still running in the click event,
    // so browsers recognize the window as user initiated.
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setPrintError("The print window was blocked. Allow pop-ups for this site, then try again.");
      return;
    }

    setPrintError(null);

    const receipt = document.querySelector<HTMLElement>("#payment-receipt-print-root");
    if (!receipt) {
      printWindow.close();
      setPrintError("The receipt could not be prepared for printing. Please close this dialog and try again.");
      return;
    }

    const printDocument = printWindow.document;
    printDocument.title = `Payment receipt ${payment?.receipt_number || ""}`.trim();
    printDocument.documentElement.lang = document.documentElement.lang || "en";
    printDocument.head.replaceChildren();
    printDocument.body.replaceChildren();

    const base = printDocument.createElement("base");
    base.href = new URL("/", document.baseURI).href;
    printDocument.head.append(base);

    const stylesheetLoads: Promise<void>[] = [];
    document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLLinkElement | HTMLStyleElement;
      if (clone instanceof HTMLLinkElement) {
        stylesheetLoads.push(new Promise((resolve) => {
          clone.addEventListener("load", () => resolve(), { once: true });
          clone.addEventListener("error", () => resolve(), { once: true });
        }));
      }
      printDocument.head.append(clone);
    });

    const printOverrides = printDocument.createElement("style");
    printOverrides.textContent = `
      @page { size: A4; margin: 12mm; }
      html, body {
        width: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: white !important;
      }
      #payment-receipt-print-root {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        overflow: visible !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        break-inside: avoid;
        page-break-inside: avoid;
        background: white !important;
      }
      #payment-receipt-print-root, #payment-receipt-print-root * {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }
      #payment-receipt-print-root header,
      #payment-receipt-print-root section,
      #payment-receipt-print-root footer,
      #payment-receipt-print-root dl > div {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    `;
    printDocument.head.append(printOverrides);
    printDocument.body.append(receipt.cloneNode(true));

    const imageLoads = Array.from(printDocument.images, (image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    });

    await Promise.all([...stylesheetLoads, ...imageLoads]);

    printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="receipt-dialog max-h-[calc(100vh-2rem)] max-w-[820px] overflow-y-auto p-4 sm:max-w-[820px] sm:p-6">
        <DialogHeader className="print:hidden">
          <DialogTitle>Payment receipt</DialogTitle>
          <DialogDescription>Review this receipt, then open the browser print dialog to print it or save it as a PDF.</DialogDescription>
        </DialogHeader>
        {payment && <PaymentReceipt payment={payment} />}
        <DialogFooter className="receipt-actions print:hidden">
          <DialogClose render={<button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted" />}>Close</DialogClose>
          <button type="button" onClick={handlePrint} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#861d2d] px-4 text-sm font-semibold text-white hover:bg-[#6f1725]">
            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
          </button>
          {printError && <p role="alert" className="w-full text-sm text-destructive">{printError}</p>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
