import PageHeader from "@/components/layout/PageHeader";
import MembershipsManagement from "@/components/memberships/MembershipsManagement";

export default function MembershipsPage() {
  return (
    <>
      <PageHeader
        title="Memberships"
        description="Track renewals, expiries, freezes, and fee balances"
      />
      <MembershipsManagement />
    </>
  );
}
