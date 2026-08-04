"use client";

import { LoaderCircle, ShieldAlert, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SafeDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function SafeDeleteDialog({
  open,
  title,
  description,
  deleting,
  onOpenChange,
  onConfirm,
}: SafeDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !deleting && onOpenChange(next)}>
      <DialogContent showCloseButton={!deleting}>
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <ShieldAlert className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          This action cannot be undone. Linked records are protected and will prevent deletion.
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={deleting} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={deleting} onClick={onConfirm}>
            {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            {deleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
