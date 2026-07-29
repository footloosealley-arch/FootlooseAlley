import PublicIntakeLinks from "@/components/settings/PublicIntakeLinks";
import StaffManagement from "@/components/settings/StaffManagement";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PublicIntakeLinks />
      <StaffManagement />
    </div>
  );
}
