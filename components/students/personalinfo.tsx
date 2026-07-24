type PersonalInfoProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function PersonalInfo({
  formData,
  setFormData,
}: PersonalInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>

      <input
        className="w-full rounded border p-2"
        placeholder="Student Name"
        value={formData.Name || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({ ...prev, Name: e.target.value }))
        }
      />

      <input
        className="w-full rounded border p-2"
        placeholder="Date of Birth"
        type="date"
        value={formData.date_of_birth || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({
            ...prev,
            date_of_birth: e.target.value,
          }))
        }
      />
    </div>
  );
}