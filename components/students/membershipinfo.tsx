type MembershipInfoProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function MembershipInfo({
  formData,
  setFormData,
}: MembershipInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Membership</h2>

      <input
        className="w-full rounded border p-2"
        placeholder="Program"
        value={formData.Program || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({ ...prev, Program: e.target.value }))
        }
      />

      <input
        className="w-full rounded border p-2"
        type="number"
        placeholder="Fees"
        value={formData.Fees || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({
            ...prev,
            Fees: Number(e.target.value),
          }))
        }
      />

      <input
        className="w-full rounded border p-2"
        type="date"
        value={formData.Due_date || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({
            ...prev,
            Due_date: e.target.value,
          }))
        }
      />
    </div>
  );
}