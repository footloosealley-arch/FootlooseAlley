"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, IndianRupee, LoaderCircle, Plus, RefreshCw, Trash2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import SafeDeleteDialog from "@/components/common/SafeDeleteDialog";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatCard from "@/components/ui-foundation/StatCard";
import { EXPENSE_CATEGORIES, financeOperationsService, type Reconciliation, type StudioExpense } from "@/services/finance-operations.service";

const today = () => new Date().toISOString().slice(0, 10);
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<StudioExpense[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<StudioExpense | null>(null);
  const [expense, setExpense] = useState({ date: today(), category: "Rent", description: "", amount: "", method: "UPI", reference: "", notes: "" });
  const [reconcile, setReconcile] = useState({ date: today(), opening: "", counted: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await financeOperationsService.getAll();
      setExpenses(data.expenses);
      setReconciliations(data.reconciliations);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load finance operations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function addExpense(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await financeOperationsService.addExpense({ ...expense, amount: Number(expense.amount) });
      toast.success("Studio expense recorded.");
      setExpense((current) => ({ ...current, description: "", amount: "", reference: "", notes: "" }));
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add expense.");
    } finally {
      setSaving(false);
    }
  }

  async function saveReconciliation(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await financeOperationsService.reconcile({ date: reconcile.date, opening: Number(reconcile.opening || 0), counted: Number(reconcile.counted || 0), notes: reconcile.notes });
      toast.success("Cash reconciliation saved.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reconcile cash.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense() {
    if (!deleting) return;
    setSaving(true);
    try {
      await financeOperationsService.deleteExpense(deleting.id);
      toast.success("Expense deleted.");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete expense.");
    } finally {
      setSaving(false);
    }
  }

  const currentMonth = today().slice(0, 7);
  const monthExpenses = useMemo(() => expenses.filter((item) => item.expense_date.startsWith(currentMonth)).reduce((sum, item) => sum + item.amount, 0), [expenses, currentMonth]);
  const latest = reconciliations[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses & Reconciliation" description="Track general studio costs and reconcile daily cash separately from events and instructor payouts." action={<Button type="button" variant="outline" onClick={() => void load()}><RefreshCw className={loading ? "animate-spin" : ""} />Refresh</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="This month expenses" value={money.format(monthExpenses)} icon={IndianRupee} />
        <StatCard label="Expense records" value={expenses.length} icon={WalletCards} />
        <StatCard label="Latest cash variance" value={money.format(latest?.variance ?? 0)} icon={Calculator} />
        <StatCard label="Reconciliations" value={reconciliations.length} icon={Calculator} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">Add general studio expense</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={addExpense}>
            <label><Label>Date</Label><Input className="mt-1" type="date" required value={expense.date} onChange={(event) => setExpense({ ...expense, date: event.target.value })} /></label>
            <label><Label>Category</Label><select className="mt-1 h-10 w-full rounded-md border px-3" value={expense.category} onChange={(event) => setExpense({ ...expense, category: event.target.value })}>{EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="sm:col-span-2"><Label>Description</Label><Input className="mt-1" required value={expense.description} onChange={(event) => setExpense({ ...expense, description: event.target.value })} /></label>
            <label><Label>Amount (₹)</Label><Input className="mt-1" type="number" min="0.01" step="0.01" required value={expense.amount} onChange={(event) => setExpense({ ...expense, amount: event.target.value })} /></label>
            <label><Label>Payment method</Label><select className="mt-1 h-10 w-full rounded-md border px-3" value={expense.method} onChange={(event) => setExpense({ ...expense, method: event.target.value })}>{["Cash", "UPI", "Card", "Bank Transfer"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><Label>Reference</Label><Input className="mt-1" value={expense.reference} onChange={(event) => setExpense({ ...expense, reference: event.target.value })} /></label>
            <label><Label>Notes</Label><Input className="mt-1" value={expense.notes} onChange={(event) => setExpense({ ...expense, notes: event.target.value })} /></label>
            <Button type="submit" className="sm:col-span-2" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" /> : <Plus />}Add expense</Button>
          </form>
        </section>
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">Daily cash reconciliation</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cash income and cash expenses are calculated automatically.</p>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={saveReconciliation}>
            <label><Label>Date</Label><Input className="mt-1" type="date" required value={reconcile.date} onChange={(event) => setReconcile({ ...reconcile, date: event.target.value })} /></label>
            <label><Label>Opening cash (₹)</Label><Input className="mt-1" type="number" min="0" step="0.01" value={reconcile.opening} onChange={(event) => setReconcile({ ...reconcile, opening: event.target.value })} /></label>
            <label><Label>Counted closing cash (₹)</Label><Input className="mt-1" type="number" min="0" step="0.01" required value={reconcile.counted} onChange={(event) => setReconcile({ ...reconcile, counted: event.target.value })} /></label>
            <label><Label>Notes</Label><Input className="mt-1" value={reconcile.notes} onChange={(event) => setReconcile({ ...reconcile, notes: event.target.value })} /></label>
            <Button type="submit" className="sm:col-span-2" disabled={saving}><Calculator />Reconcile cash</Button>
          </form>
          <div className="mt-4 space-y-2">{reconciliations.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl border p-3 text-sm"><strong>{item.reconciliation_date}</strong><p className="text-muted-foreground">Expected {money.format(item.expected_cash)} · Counted {money.format(item.counted_cash)} · Variance <span className={item.variance === 0 ? "text-emerald-600" : "text-red-600"}>{money.format(item.variance)}</span></p></div>)}</div>
        </section>
      </div>
      <section className="rounded-2xl border bg-card p-4">
        <h2 className="font-semibold">Recent general expenses</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {expenses.slice(0, 20).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"><div className="min-w-0"><strong>{item.description}</strong><p className="text-muted-foreground">{item.expense_date} · {item.category} · {item.payment_method}</p></div><div className="flex shrink-0 items-center gap-2"><strong>{money.format(item.amount)}</strong><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${item.description}`} onClick={() => setDeleting(item)}><Trash2 /></Button></div></div>)}
          {!expenses.length && <p className="text-sm text-muted-foreground">No general expenses recorded.</p>}
        </div>
      </section>
      <SafeDeleteDialog open={Boolean(deleting)} title={`Delete ${deleting?.description ?? "expense"}?`} description="This permanently removes the expense and immediately updates reports. Administrator access is required." deleting={saving} onOpenChange={(open) => !open && setDeleting(null)} onConfirm={() => void deleteExpense()} />
    </div>
  );
}
