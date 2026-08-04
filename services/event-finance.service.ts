import { supabase } from "@/lib/supabase";

export const EVENT_EXPENSE_CATEGORIES = ["Venue", "Instructor", "Marketing", "Equipment", "Travel", "Refreshments", "Other"] as const;
export type EventExpenseCategory = (typeof EVENT_EXPENSE_CATEGORIES)[number];

export interface EventExpense {
  id: number;
  event_id: number;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  reference_number: string | null;
  created_at: string;
}

export interface EventExpenseInput {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method?: string | null;
  reference_number?: string | null;
}

export interface EventProfitability {
  eventId: number;
  registrations: number;
  attendees: number;
  grossRevenue: number;
  refunds: number;
  netRevenue: number;
  expenses: number;
  profit: number;
  attendanceRate: number;
  capacityUsage: number;
  averageRevenuePerAttendee: number;
}

function errorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error ? `${fallback} ${String(error.message)}` : fallback;
}

function normalize(input: EventExpenseInput) {
  const category = input.category.trim();
  const description = input.description.trim();
  const amount = Number(input.amount);
  if (category.length < 2) throw new Error("Select an expense category.");
  if (description.length < 2) throw new Error("Enter an expense description.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Expense amount must be greater than zero.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.expense_date)) throw new Error("Choose a valid expense date.");
  return { category, description, amount: Number(amount.toFixed(2)), expense_date: input.expense_date, payment_method: input.payment_method?.trim() || null, reference_number: input.reference_number?.trim() || null };
}

async function getExpenses(eventId: number): Promise<EventExpense[]> {
  const { data, error } = await supabase.from("Event_Expenses").select("id,event_id,category,description,amount,expense_date,payment_method,reference_number,created_at").eq("event_id", eventId).order("expense_date", { ascending: false }).order("id", { ascending: false });
  if (error) throw new Error(errorMessage(error, "Unable to load event expenses."));
  return (data ?? []).map((row) => ({ ...row, amount: Number(row.amount) })) as EventExpense[];
}

async function createExpense(eventId: number, input: EventExpenseInput) {
  const { error } = await supabase.from("Event_Expenses").insert({ event_id: eventId, ...normalize(input) });
  if (error) throw new Error(errorMessage(error, "Unable to save event expense."));
}

async function updateExpense(id: number, input: EventExpenseInput) {
  const { error } = await supabase.from("Event_Expenses").update({ ...normalize(input), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(errorMessage(error, "Unable to update event expense."));
}

async function removeExpense(id: number) {
  const { error } = await supabase.from("Event_Expenses").delete().eq("id", id);
  if (error) throw new Error(errorMessage(error, "Unable to delete event expense."));
}

async function getProfitability(eventId: number, capacity: number): Promise<EventProfitability> {
  const [registrationsResult, refundsResult, expensesResult] = await Promise.all([
    supabase.from("Event_Registrations").select("payment_status,amount_paid,attendance_status,group_size,cancelled_at").eq("event_id", eventId),
    supabase.from("Event_Refunds").select("amount").eq("event_id", eventId),
    supabase.from("Event_Expenses").select("amount").eq("event_id", eventId),
  ]);
  if (registrationsResult.error) throw new Error(errorMessage(registrationsResult.error, "Unable to load event registrations."));
  if (refundsResult.error) throw new Error(errorMessage(refundsResult.error, "Unable to load event refunds."));
  if (expensesResult.error) throw new Error(errorMessage(expensesResult.error, "Unable to load event expenses."));
  const active = (registrationsResult.data ?? []).filter((row) => !row.cancelled_at);
  const registrations = active.reduce((sum, row) => sum + Math.max(1, Number(row.group_size ?? 1)), 0);
  const attendees = active.filter((row) => row.attendance_status === "Attended").reduce((sum, row) => sum + Math.max(1, Number(row.group_size ?? 1)), 0);
  const grossRevenue = (registrationsResult.data ?? []).filter((row) => ["Paid", "Refunded"].includes(row.payment_status)).reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0);
  const refunds = (refundsResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const expenses = (expensesResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const netRevenue = grossRevenue - refunds;
  return {
    eventId, registrations, attendees, grossRevenue: Number(grossRevenue.toFixed(2)), refunds: Number(refunds.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)), expenses: Number(expenses.toFixed(2)), profit: Number((netRevenue - expenses).toFixed(2)),
    attendanceRate: registrations ? Number(((attendees / registrations) * 100).toFixed(1)) : 0,
    capacityUsage: capacity ? Number(((registrations / capacity) * 100).toFixed(1)) : 0,
    averageRevenuePerAttendee: attendees ? Number((netRevenue / attendees).toFixed(2)) : 0,
  };
}

export const eventFinanceService = { getExpenses, createExpense, updateExpense, removeExpense, getProfitability };
