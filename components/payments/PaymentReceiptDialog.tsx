"use client";

import { Printer } from "lucide-react";
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
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#861d2d] px-4 text-sm font-semibold text-white hover:bg-[#6f1725]">
            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
          </button>
        </DialogFooter>
        <style jsx global>{`
          @page { size: A4; margin: 12mm; }
          @media print {
            html, body {
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: white !important;
            }
            body *:not(#payment-receipt-print-root):not(#payment-receipt-print-root *):not(:has(#payment-receipt-print-root)) {
              display: none !important;
            }
            [data-slot="dialog-overlay"], .receipt-actions {
              display: none !important;
            }
            #payment-receipt-print-root, #payment-receipt-print-root * { visibility: visible !important; }
            #payment-receipt-print-root { position: static !important; width: 100% !important; max-width: none; margin: 0 !important; border: 0; box-shadow: none; break-inside: avoid; page-break-inside: avoid; }
            .receipt-dialog { position: static !important; display: block !important; width: 100% !important; height: auto !important; min-height: 0 !important; margin: 0 !important; transform: none !important; overflow: visible !important; max-height: none !important; max-width: none !important; padding: 0 !important; background: white !important; box-shadow: none !important; }
            .receipt-sheet header, .receipt-sheet h1, .receipt-sheet strong { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
