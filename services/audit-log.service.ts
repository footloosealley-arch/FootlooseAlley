import { supabase } from "@/lib/supabase";

export interface AuditLogEntry {
  id: number;
  table_name: string;
  record_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  changed_by: string | null;
  changed_at: string;
}

async function getRecent(limit = 200): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("studio_audit_log")
    .select("id,table_name,record_id,action,changed_by,changed_at")
    .order("changed_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Unable to load audit history. ${error.message}`);
  return (data ?? []) as AuditLogEntry[];
}

export const auditLogService = { getRecent };
