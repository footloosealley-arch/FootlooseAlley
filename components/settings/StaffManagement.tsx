"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth, type AppRole } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

interface StaffProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
  created_at: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function StaffManagement() {
  const { user, profile } = useAuth();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    if (profile?.role !== "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,is_active,created_at")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      setStaff([]);
    } else {
      setStaff((data ?? []) as StaffProfile[]);
    }
    setLoading(false);
  }, [profile?.role]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const summary = useMemo(
    () => ({
      total: staff.length,
      admins: staff.filter((member) => member.role === "admin" && member.is_active).length,
      receptionists: staff.filter(
        (member) => member.role === "receptionist" && member.is_active
      ).length,
      inactive: staff.filter((member) => !member.is_active).length,
    }),
    [staff]
  );

  async function changeRole(member: StaffProfile, role: AppRole) {
    if (member.id === user?.id) {
      toast.error("You cannot change your own administrator role.");
      return;
    }
    setSavingId(member.id);
    const { error } = await supabase.rpc("set_staff_role", {
      target_user: member.id,
      new_role: role,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(`${member.full_name || member.email} is now ${role}.`);
      await loadStaff();
    }
    setSavingId(null);
  }

  async function changeAccess(member: StaffProfile, active: boolean) {
    if (member.id === user?.id) {
      toast.error("You cannot deactivate your own account.");
      return;
    }
    setSavingId(member.id);
    const { error } = await supabase.rpc("set_staff_access", {
      target_user: member.id,
      active,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(active ? "Staff access restored." : "Staff access deactivated.");
      await loadStaff();
    }
    setSavingId(null);
  }

  async function copySignupLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/login`);
    toast.success("Staff signup link copied.");
  }

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
        <ShieldOff className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 text-xl font-bold">Administrator access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only administrators can view staff accounts or change access levels.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Staff & Security Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage administrator and receptionist access to Footloose Alley.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void loadStaff()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => void copySignupLink()}>
            <Copy className="h-4 w-4" />
            Copy Staff Signup Link
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Staff Accounts", summary.total, Users, "bg-blue-100 text-blue-700"],
          ["Administrators", summary.admins, ShieldCheck, "bg-violet-100 text-violet-700"],
          ["Receptionists", summary.receptionists, UserCog, "bg-emerald-100 text-emerald-700"],
          ["Inactive", summary.inactive, ShieldOff, "bg-slate-100 text-slate-700"],
        ].map(([title, value, Icon, tone]) => {
          const IconComponent = Icon as typeof Users;
          return (
            <div key={String(title)} className="rounded-2xl border bg-background p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{String(title)}</p>
                  <p className="mt-2 text-3xl font-bold">{String(value)}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${String(tone)}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">Adding a receptionist</p>
        <p className="mt-1">
          Send the staff signup link. After they create and confirm their account, it
          appears below with receptionist access. You can then change their role or
          deactivate access.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">Staff Accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Active receptionists can operate studio records but cannot delete them.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading staff accounts...
          </div>
        ) : (
          <div className="divide-y">
            {staff.map((member) => {
              const isSelf = member.id === user?.id;
              const saving = savingId === member.id;
              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">
                        {member.full_name || "Unnamed Staff"}
                      </p>
                      {isSelf && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          You
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          member.role === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {member.role}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.is_active
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {member.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added {formatDate(member.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={member.role}
                      onChange={(event) =>
                        void changeRole(member, event.target.value as AppRole)
                      }
                      disabled={isSelf || saving}
                      className="h-10 rounded-lg border bg-background px-3 text-sm disabled:opacity-50"
                    >
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <Button
                      variant={member.is_active ? "outline" : "default"}
                      onClick={() => void changeAccess(member, !member.is_active)}
                      disabled={isSelf || saving}
                    >
                      {saving ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : member.is_active ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      {member.is_active ? "Deactivate" : "Restore Access"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
