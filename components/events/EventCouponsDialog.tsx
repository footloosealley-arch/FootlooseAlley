"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LoaderCircle, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventCouponsService, type EventCoupon, type EventCouponInput } from "@/services/event-coupons.service";
import type { StudioEvent } from "@/services/events.service";

const empty: EventCouponInput = { code: "ALLEY10", discount_percent: 10, expires_at: null, usage_limit: null, is_active: true };

export default function EventCouponsDialog({ open, eventItem, onOpenChange }: { open: boolean; eventItem: StudioEvent | null; onOpenChange: (open: boolean) => void }) {
  const [items, setItems] = useState<EventCoupon[]>([]);
  const [form, setForm] = useState<EventCouponInput>({ ...empty });
  const [editing, setEditing] = useState<EventCoupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!eventItem) return;
    setLoading(true); setError("");
    try { setItems(await eventCouponsService.getByEvent(eventItem.id)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load coupons."); }
    finally { setLoading(false); }
  }, [eventItem]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [open, load]);
  function startAdd() { setEditing(null); setForm({ ...empty, code: items.some((item) => item.code === "ALLEY10") ? "ALLEY20" : "ALLEY10", discount_percent: items.some((item) => item.code === "ALLEY10") ? 20 : 10 }); setShowForm(true); setError(""); }
  function startEdit(item: EventCoupon) { setEditing(item); setForm({ code: item.code, discount_percent: Number(item.discount_percent), expires_at: item.expires_at?.slice(0, 16) ?? null, usage_limit: item.usage_limit, is_active: item.is_active }); setShowForm(true); setError(""); }
  function closeForm() { setEditing(null); setShowForm(false); setForm({ ...empty }); }

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!eventItem) return; setSaving(true); setError("");
    try { if (editing) await eventCouponsService.update(editing.id, form); else await eventCouponsService.create(eventItem.id, form); toast.success(editing ? "Coupon updated." : "Coupon added."); closeForm(); await load(); }
    catch (caught) { const message = caught instanceof Error ? caught.message : "Unable to save coupon."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  }

  async function remove(item: EventCoupon) {
    if (!window.confirm(`Delete coupon ${item.code}?`)) return;
    setSaving(true); try { await eventCouponsService.remove(item.id); toast.success("Coupon deleted."); await load(); } catch (caught) { toast.error(caught instanceof Error ? caught.message : "Unable to delete coupon."); } finally { setSaving(false); }
  }

  return <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}><DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{eventItem?.title ?? "Event"} coupons</DialogTitle><DialogDescription>Create percentage discount codes for the public registration page.</DialogDescription></DialogHeader>
    {showForm ? <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-muted/20 p-4 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h3 className="font-semibold">{editing ? "Edit coupon" : "Add coupon"}</h3><Button type="button" variant="ghost" size="icon-sm" onClick={closeForm}><X /><span className="sr-only">Close</span></Button></div><div className="space-y-2"><Label htmlFor="coupon-code">Coupon code</Label><Input id="coupon-code" required maxLength={24} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="ALLEY10" /></div><div className="space-y-2"><Label htmlFor="coupon-discount">Discount (%)</Label><Input id="coupon-discount" type="number" min={1} max={100} step="0.01" required value={form.discount_percent} onChange={(event) => setForm({ ...form, discount_percent: Number(event.target.value) })} /></div><div className="space-y-2"><Label htmlFor="coupon-expiry">Expiry (optional)</Label><Input id="coupon-expiry" type="datetime-local" value={form.expires_at ?? ""} onChange={(event) => setForm({ ...form, expires_at: event.target.value || null })} /></div><div className="space-y-2"><Label htmlFor="coupon-limit">Usage limit (optional)</Label><Input id="coupon-limit" type="number" min={1} value={form.usage_limit ?? ""} onChange={(event) => setForm({ ...form, usage_limit: event.target.value ? Number(event.target.value) : null })} /></div><label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label>{error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}<div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:flex sm:justify-end"><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <LoaderCircle className="animate-spin" />}Save coupon</Button></div></form> : <Button type="button" className="w-full sm:w-fit" onClick={startAdd}><Plus /> Add coupon</Button>}
    {loading ? <p className="py-8 text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 animate-spin" />Loading coupons…</p> : items.length === 0 ? <p className="rounded-xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">No coupons yet. Add ALLEY10 or ALLEY20.</p> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="flex items-center gap-2 font-bold"><Tag className="size-4 text-primary" />{item.code}<span className={item.is_active ? "text-xs text-emerald-700" : "text-xs text-muted-foreground"}>{item.is_active ? "Active" : "Disabled"}</span></p><p className="mt-1 text-sm text-muted-foreground">{Number(item.discount_percent)}% off{item.usage_limit ? ` · limit ${item.usage_limit}` : " · unlimited"}{item.expires_at ? ` · expires ${new Date(item.expires_at).toLocaleString("en-IN")}` : ""}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil /> Edit</Button><Button type="button" size="sm" variant="outline" className="text-destructive" onClick={() => void remove(item)}><Trash2 /> Delete</Button></div></div>)}</div>}
  </DialogContent></Dialog>;
}
