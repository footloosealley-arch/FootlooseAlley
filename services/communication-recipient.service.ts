import { supabase } from "@/lib/supabase";

export type CommunicationRecipientType = "Student" | "Enquiry";

export interface CommunicationRecipient {
  key: string;
  id: number;
  type: CommunicationRecipientType;
  name: string;
  phone: string;
  program: string;
  batch: string;
  status: string;
}

interface StudentRow {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  batch: string | null;
  Status: string | null;
  whatsapp_enabled: boolean | null;
}

interface EnquiryRow {
  id: number;
  Name: string | null;
  Phone: string | null;
  Program: string | null;
  Status: string | null;
}

function recipientName(value: string | null, fallback: string): string {
  return value?.trim() || fallback;
}

class CommunicationRecipientService {
  async getRecipients(): Promise<CommunicationRecipient[]> {
    const [studentsResult, enquiriesResult] = await Promise.all([
      supabase
        .from("Students")
        .select("id,Name,Phone,Program,batch,Status,whatsapp_enabled")
        .order("Name", { ascending: true }),
      supabase
        .from("Enquiries")
        .select("id,Name,Phone,Program,Status")
        .order("Name", { ascending: true }),
    ]);

    if (studentsResult.error) throw studentsResult.error;
    if (enquiriesResult.error) throw enquiriesResult.error;

    const students = (studentsResult.data ?? []) as StudentRow[];
    const enquiries = (enquiriesResult.data ?? []) as EnquiryRow[];

    return [
      ...students
        .filter((student) => student.whatsapp_enabled !== false)
        .map((student) => ({
          key: `student-${student.id}`,
          id: Number(student.id),
          type: "Student" as const,
          name: recipientName(student.Name, `Student #${student.id}`),
          phone: student.Phone?.trim() || "",
          program: student.Program?.trim() || "",
          batch: student.batch?.trim() || "",
          status: student.Status?.trim() || "",
        })),
      ...enquiries.map((enquiry) => ({
        key: `enquiry-${enquiry.id}`,
        id: Number(enquiry.id),
        type: "Enquiry" as const,
        name: recipientName(enquiry.Name, `Enquiry #${enquiry.id}`),
        phone: enquiry.Phone?.trim() || "",
        program: enquiry.Program?.trim() || "",
        batch: "",
        status: enquiry.Status?.trim() || "",
      })),
    ].sort((first, second) => first.name.localeCompare(second.name));
  }
}

export const communicationRecipientService = new CommunicationRecipientService();
