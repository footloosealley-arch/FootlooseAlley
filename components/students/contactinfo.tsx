type ContactInfoProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function ContactInfo({
  formData,
  setFormData,
}: ContactInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Contact Information</h2>

      <input
        className="w-full rounded border p-2"
        placeholder="Phone"
        value={formData.Phone || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({ ...prev, Phone: e.target.value }))
        }
      />

      <input
        className="w-full rounded border p-2"
        placeholder="Email"
        value={formData.Email || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({ ...prev, Email: e.target.value }))
        }
      />

      <textarea
        className="w-full rounded border p-2"
        placeholder="Address"
        value={formData.Address || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({ ...prev, Address: e.target.value }))
        }
      />
    </div>
  );
}