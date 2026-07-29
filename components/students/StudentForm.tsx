"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Heart,
  Phone,
  User,
  Users,
} from "lucide-react";

import MembershipSelector from "@/components/students/MembershipSelector";
import StudentPhotoUpload from "@/components/students/StudentPhotoUpload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { studentsService } from "@/services/students.service";
import { STUDIO_BATCHES } from "@/lib/studio-batches";

export type StudentFormData = {
  name: string;
  phone: string;
  email: string;

  photoUrl: string | null;

  gender: string;
  dateOfBirth: string;

  address: string;
  emergencyContact: string;

  whatsappEnabled: boolean;

  program: string;

  classId: number | null;
  instructorId: number | null;

  membershipPlan: string;

  fees: number;
  discount: number;
  feesDue: number;

  joinDate: string;
  nextDueDate: string;

  medicalNotes: string;
  notes: string;
};

type StudentFormProps = {
  loading?: boolean;
  studentId?: number | string | null;
  initialValues?: Partial<StudentFormData>;
  onSubmit: (
    values: StudentFormData
  ) => Promise<void>;
  onCancel: () => void;
};

type ClassItem = {
  id: number;
  class_name: string | null;
};

type InstructorItem = {
  id: number;
  name: string | null;
};

type ValidationErrors = Partial<
  Record<keyof StudentFormData, string>
>;

const defaultValues: StudentFormData = {
  name: "",
  phone: "",
  email: "",

  photoUrl: null,

  gender: "",
  dateOfBirth: "",

  address: "",
  emergencyContact: "",

  whatsappEnabled: true,

  program: "",

  classId: null,
  instructorId: null,

  membershipPlan: "Monthly",

  fees: 2500,
  discount: 0,
  feesDue: 2500,

  joinDate: new Date()
    .toISOString()
    .split("T")[0],

  nextDueDate: "",

  medicalNotes: "",
  notes: "",
};

export default function StudentForm({
  loading = false,
  studentId,
  initialValues,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const [form, setForm] =
    useState<StudentFormData>({
      ...defaultValues,
      ...initialValues,
    });

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  const [classes, setClasses] = useState<
    ClassItem[]
  >([]);

  const [instructors, setInstructors] =
    useState<InstructorItem[]>([]);

  const [loadingData, setLoadingData] =
    useState(true);

  const [dataError, setDataError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoadingData(true);
        setDataError(null);

        const [
          classList,
          instructorList,
        ] = await Promise.all([
          studentsService.getClasses(),
          studentsService.getInstructors(),
        ]);

        if (!active) {
          return;
        }

        setClasses(classList);
        setInstructors(instructorList);
      } catch (error) {
        console.error(
          "Unable to load classes and instructors:",
          error
        );

        if (active) {
          setDataError(
            error instanceof Error
              ? error.message
              : "Unable to load classes and instructors."
          );
        }
      } finally {
        if (active) {
          setLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const isValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.program.trim() !== "" &&
      form.membershipPlan.trim() !== ""
    );
  }, [
    form.name,
    form.phone,
    form.program,
    form.membershipPlan,
  ]);

  function updateField<
    K extends keyof StudentFormData,
  >(
    field: K,
    value: StudentFormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  }

  function validate() {
    const nextErrors: ValidationErrors =
      {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Student name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required.";
    }

    if (!form.program.trim()) {
      nextErrors.program =
        "Batch or class is required.";
    }

    if (!form.membershipPlan.trim()) {
      nextErrors.membershipPlan =
        "Membership plan is required.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <StudentPhotoUpload
        value={form.photoUrl}
        studentId={studentId}
        onChange={(photoUrl) =>
          updateField("photoUrl", photoUrl)
        }
        disabled={loading}
      />

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Personal Information
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Student Name *
            </Label>

            <Input
              id="name"
              placeholder="Enter full name"
              value={form.name}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
            />

            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number *
            </Label>

            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="9876543210"
              value={form.phone}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
            />

            {errors.phone && (
              <p className="text-sm text-destructive">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
            />

            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender
            </Label>

            <Select
              value={form.gender}
              disabled={loading}
              onValueChange={(value) =>
  updateField(
    "gender",
    value ?? ""
  )
}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Male">
                  Male
                </SelectItem>

                <SelectItem value="Female">
                  Female
                </SelectItem>

                <SelectItem value="Other">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">
              Date of Birth
            </Label>

            <Input
              id="dob"
              type="date"
              value={form.dateOfBirth}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "dateOfBirth",
                  event.target.value
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Contact Information
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">
              Address
            </Label>

            <Textarea
              id="address"
              rows={3}
              placeholder="Enter complete address"
              value={form.address}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency">
              Emergency Contact
            </Label>

            <Input
              id="emergency"
              type="tel"
              inputMode="tel"
              placeholder="Emergency phone number"
              value={form.emergencyContact}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "emergencyContact",
                  event.target.value
                )
              }
            />
          </div>

          <div className="flex items-center gap-3 pt-8">
            <input
              id="whatsapp"
              type="checkbox"
              checked={form.whatsappEnabled}
              disabled={loading}
              onChange={(event) =>
                updateField(
                  "whatsappEnabled",
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <Label htmlFor="whatsapp">
              WhatsApp Enabled
            </Label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Studio Information
          </h2>
        </div>

        {loadingData ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading classes and
            instructors...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="program">
                Batch / Class *
              </Label>

              <Select
                value={form.program}
                disabled={loading}
     onValueChange={(value) =>
  updateField(
    "program",
    value ?? ""
  )
}
              >
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select batch or class" />
                </SelectTrigger>

                <SelectContent>
                  {STUDIO_BATCHES.map((batch) => (
                    <SelectItem
                      key={batch}
                      value={batch}
                    >
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.program && (
                <p className="text-sm text-destructive">
                  {errors.program}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">
                Join Date
              </Label>

              <Input
                id="joinDate"
                type="date"
                value={form.joinDate}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "joinDate",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">
                Class
              </Label>

              <Select
                value={
                  form.classId === null
                    ? ""
                    : String(form.classId)
                }
                disabled={loading}
                onValueChange={(value) =>
                  updateField(
                    "classId",
                    value
                      ? Number(value)
                      : null
                  )
                }
              >
                <SelectTrigger id="classId">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>

                <SelectContent>
                  {classes.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={String(item.id)}
                    >
                      {item.class_name ||
                        `Class ${item.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructorId">
                Instructor
              </Label>

              <Select
                value={
                  form.instructorId === null
                    ? ""
                    : String(
                        form.instructorId
                      )
                }
                disabled={loading}
                onValueChange={(value) =>
                  updateField(
                    "instructorId",
                    value
                      ? Number(value)
                      : null
                  )
                }
              >
                <SelectTrigger id="instructorId">
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>

                <SelectContent>
                  {instructors.map(
                    (item) => (
                      <SelectItem
                        key={item.id}
                        value={String(
                          item.id
                        )}
                      >
                        {item.name ||
                          `Instructor ${item.id}`}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {dataError && (
          <p className="mt-4 text-sm text-destructive">
            {dataError}
          </p>
        )}
      </section>

      <div className="space-y-2">
        <MembershipSelector
          value={{
            plan: form.membershipPlan,
            fee: form.fees,
            discount: form.discount,
            due: form.feesDue,
            nextDueDate:
              form.nextDueDate,
          }}
          onChange={(membership) => {
            setForm((previous) => ({
              ...previous,
              membershipPlan:
                membership.plan,
              fees: membership.fee,
              discount:
                membership.discount,
              feesDue: membership.due,
              nextDueDate:
                membership.nextDueDate,
            }));

            if (
              errors.membershipPlan
            ) {
              setErrors((previous) => ({
                ...previous,
                membershipPlan:
                  undefined,
              }));
            }
          }}
          disabled={loading}
        />

        {errors.membershipPlan && (
          <p className="text-sm text-destructive">
            {errors.membershipPlan}
          </p>
        )}
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Medical Information
          </h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalNotes">
            Medical Notes
          </Label>

          <Textarea
            id="medicalNotes"
            rows={4}
            placeholder="Allergies, injuries, medical conditions, medications, etc."
            value={form.medicalNotes}
            disabled={loading}
            onChange={(event) =>
              updateField(
                "medicalNotes",
                event.target.value
              )
            }
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Additional Notes
          </h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">
            Notes
          </Label>

          <Textarea
            id="notes"
            rows={5}
            placeholder="Any additional remarks..."
            value={form.notes}
            disabled={loading}
            onChange={(event) =>
              updateField(
                "notes",
                event.target.value
              )
            }
          />
        </div>
      </section>

      <section className="rounded-xl border bg-muted/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Membership Summary
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">
              Plan
            </span>

            <span className="font-medium">
              {form.membershipPlan}
            </span>
          </div>

          <div className="flex justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">
              Membership Fee
            </span>

            <span className="font-medium">
              ₹
              {form.fees.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="flex justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">
              Discount
            </span>

            <span className="font-medium">
              ₹
              {form.discount.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="flex justify-between rounded-lg border bg-background p-3">
            <span className="text-muted-foreground">
              Fees Due
            </span>

            <span className="font-semibold text-primary">
              ₹
              {form.feesDue.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            loading ||
            loadingData ||
            !isValid
          }
        >
          {loading
            ? "Saving..."
            : "Save Student"}
        </Button>
      </div>
    </form>
  );
}
