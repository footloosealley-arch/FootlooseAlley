import { supabase } from "@/lib/supabase";

export const MESSAGE_DRAFT_TYPES = [
  "enquiry",
  "fee",
  "birthday",
] as const;

export type MessageDraftType = (typeof MESSAGE_DRAFT_TYPES)[number];
export type MessageDraftTone = "Warm" | "Professional" | "Friendly";

export interface MessageDraftTarget {
  id: number;
  label: string;
  detail: string;
}

export interface MessageDraftTargets {
  enquiry: MessageDraftTarget[];
  fee: MessageDraftTarget[];
  birthday: MessageDraftTarget[];
}

interface EnquiryTargetRow {
  id: number;
  Name: string | null;
  Program: string | null;
  Status: string | null;
}

interface FeeDueTargetRow {
  id: number;
  amount_due: number | string | null;
  due_date: string | null;
  status: string | null;
  Students:
    | {
        Name: string | null;
      }
    | {
        Name: string | null;
      }[]
    | null;
}

interface StudentBirthdayTargetRow {
  id: number;
  Name: string | null;
  date_of_birth: string | null;
}

interface FunctionResponse {
  ok?: boolean;
  configured?: boolean;
  draft?: string;
  error?: string;
}

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStudentName(row: FeeDueTargetRow): string {
  const student = Array.isArray(row.Students) ? row.Students[0] : row.Students;
  return student?.Name?.trim() || "Unnamed student";
}

function formatCurrency(value: number | string | null): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

async function readFunctionError(error: unknown, fallback: string): Promise<never> {
  const context = (error as { context?: Response }).context;

  if (context instanceof Response) {
    try {
      const body = (await context.json()) as FunctionResponse;
      throw new Error(body.error || fallback);
    } catch (responseError) {
      if (responseError instanceof Error) throw responseError;
      throw new Error(fallback);
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message || fallback);
  }

  throw new Error(fallback);
}

export const messageDraftsService = {
  async getTargets(): Promise<MessageDraftTargets> {
    const today = getLocalDateString();

    const [enquiriesResult, feeDuesResult, studentsResult] = await Promise.all([
      supabase
        .from("Enquiries")
        .select("id,Name,Program,Status")
        .not("Status", "in", '("Joined","Closed")')
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("fee_dues")
        .select("id,amount_due,due_date,status,Students(Name)")
        .in("status", ["Pending", "Due Today", "Overdue"])
        .order("due_date", { ascending: true })
        .limit(100),
      supabase
        .from("Students")
        .select("id,Name,date_of_birth")
        .not("date_of_birth", "is", null)
        .order("Name", { ascending: true })
        .limit(500),
    ]);

    if (enquiriesResult.error) throw enquiriesResult.error;
    if (feeDuesResult.error) throw feeDuesResult.error;
    if (studentsResult.error) throw studentsResult.error;

    const enquiries = (enquiriesResult.data ?? []) as EnquiryTargetRow[];
    const feeDues = (feeDuesResult.data ?? []) as FeeDueTargetRow[];
    const students = (studentsResult.data ?? []) as StudentBirthdayTargetRow[];

    return {
      enquiry: enquiries.map((enquiry) => ({
        id: Number(enquiry.id),
        label: enquiry.Name?.trim() || `Enquiry #${enquiry.id}`,
        detail: [enquiry.Program, enquiry.Status].filter(Boolean).join(" - ") || "Enquiry",
      })),
      fee: feeDues.map((feeDue) => ({
        id: Number(feeDue.id),
        label: getStudentName(feeDue),
        detail: `${formatCurrency(feeDue.amount_due)} due ${feeDue.due_date ?? "date unavailable"}`,
      })),
      birthday: students
        .filter((student) => student.date_of_birth?.slice(5) === today.slice(5))
        .map((student) => ({
          id: Number(student.id),
          label: student.Name?.trim() || `Student #${student.id}`,
          detail: "Birthday today",
        })),
    };
  },

  async getStatus(): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke<FunctionResponse>(
      "message-draft",
      {
        body: { action: "status" },
      }
    );

    if (error) await readFunctionError(error, "Unable to check message draft configuration.");
    return data?.configured === true;
  },

  async generate({
    draftType,
    recordId,
    tone,
    instructions,
  }: {
    draftType: MessageDraftType;
    recordId: number;
    tone: MessageDraftTone;
    instructions: string;
  }): Promise<string> {
    const { data, error } = await supabase.functions.invoke<FunctionResponse>(
      "message-draft",
      {
        body: {
          action: "generate",
          draftType,
          recordId,
          tone,
          instructions,
        },
      }
    );

    if (error) await readFunctionError(error, "Unable to generate a message draft.");
    if (!data?.draft) throw new Error(data?.error || "The assistant did not return a draft.");

    return data.draft;
  },
};
