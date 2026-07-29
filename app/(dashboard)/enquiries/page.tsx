"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { useLatestAsync } from "@/hooks/useLatestAsync";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import NewEnquiryModal from "@/components/enquiries/NewEnquiryModal";
import EditEnquiryModal, {
  EditForm,
} from "@/components/enquiries/EditEnquiryModal";
import DeleteEnquiryModal from "@/components/enquiries/DeleteEnquiryModal";
import ConvertStudentModal from "@/components/enquiries/ConvertStudentModal";
import EnquiryTable, {
  Enquiry,
} from "@/components/enquiries/EnquiryTable";
import EnquiryKanban from "@/components/enquiries/EnquiryKanban";

import { supabase } from "@/lib/supabase";

type Class = {
  id: number;
  class_name: string;
};

type Instructor = {
  id: number;
  name: string;
};

type FollowUpFilter =
  | "All"
  | "Overdue"
  | "Today"
  | "Upcoming"
  | "No Follow-up";

type EnquiryForm = {
  Name: string;
  Phone: string;
  Email: string;
  Program: string;
  Status: string;
  Follow_up_date: string;
  Notes: string;
  source: string;
  assigned_to: string;
  last_contacted: string;
  trial_date: string;
};

const EMPTY_FORM: EnquiryForm = {
  Name: "",
  Phone: "",
  Email: "",
  Program: "",
  Status: "New",
  Follow_up_date: "",
  Notes: "",
  source: "",
  assigned_to: "",
  last_contacted: "",
  trial_date: "",
};

const STATUS_OPTIONS = [
  "All",
  "New",
  "Contacted",
  "Follow Up",
  "Trial Booked",
  "Joined",
  "Closed",
];

function getTodayString(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isFinishedStatus(
  status: string | null
): boolean {
  return (
    status === "Joined" ||
    status === "Converted" ||
    status === "Closed" ||
    status === "Not Interested"
  );
}

function isActiveEnquiry(
  enquiry: Enquiry
): boolean {
  return !isFinishedStatus(
    enquiry.Status
  );
}

function getFollowUpCategory(
  enquiry: Enquiry
): FollowUpFilter {
  if (
    !enquiry.Follow_up_date ||
    !isActiveEnquiry(enquiry)
  ) {
    return "No Follow-up";
  }

  const today = getTodayString();

  if (enquiry.Follow_up_date < today) {
    return "Overdue";
  }

  if (
    enquiry.Follow_up_date === today
  ) {
    return "Today";
  }

  return "Upcoming";
}

export default function EnquiriesPage() {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    markingFollowUpId,
    setMarkingFollowUpId,
  ] = useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [viewMode, setViewMode] =
    useState<"board" | "table">("board");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");

  const [
    followUpFilter,
    setFollowUpFilter,
  ] = useState<FollowUpFilter>(
    "All"
  );

  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [classes, setClasses] =
    useState<Class[]>([]);

  const [
    instructors,
    setInstructors,
  ] = useState<Instructor[]>([]);

  const [
    selectedEnquiry,
    setSelectedEnquiry,
  ] = useState<Enquiry | null>(null);

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<number>();

  const [
    selectedInstructor,
    setSelectedInstructor,
  ] = useState<number>();

  const [
    showNewModal,
    setShowNewModal,
  ] = useState(false);

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    showConvertModal,
    setShowConvertModal,
  ] = useState(false);

  const [editId, setEditId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<EnquiryForm>({
      ...EMPTY_FORM,
    });

  const [editForm, setEditForm] =
    useState<EditForm>({
      ...EMPTY_FORM,
    });

  const fetchData = useCallback(async () => {
    const [enquiryResult, classResult, instructorResult] = await Promise.all([
      supabase.from("Enquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("Classes").select("id,class_name").order("class_name", { ascending: true }),
      supabase.from("Instructors").select("id,name").order("name", { ascending: true }),
    ]);

    if (enquiryResult.error) throw enquiryResult.error;
    return { enquiryResult, classResult, instructorResult };
  }, []);

  const commitData = useCallback(({ enquiryResult, classResult, instructorResult }: Awaited<ReturnType<typeof fetchData>>) => {
    setEnquiries((enquiryResult.data ?? []) as Enquiry[]);
    if (!classResult.error) setClasses((classResult.data ?? []) as Class[]);
    if (!instructorResult.error) setInstructors((instructorResult.data ?? []) as Instructor[]);
  }, []);

  const handleLoadError = useCallback((error: unknown) => {
    console.error("Unable to load enquiries:", error);
    alert("Unable to load enquiries.");
  }, []);

  const { loading, refresh: loadData } = useLatestAsync({
    fetchData,
    onSuccess: commitData,
    onError: handleLoadError,
  });

  const summary = useMemo(() => {
    const active =
      enquiries.filter(
        isActiveEnquiry
      ).length;

    const overdue =
      enquiries.filter(
        (enquiry) =>
          getFollowUpCategory(
            enquiry
          ) === "Overdue"
      ).length;

    const today =
      enquiries.filter(
        (enquiry) =>
          getFollowUpCategory(
            enquiry
          ) === "Today"
      ).length;

    const upcoming =
      enquiries.filter(
        (enquiry) =>
          getFollowUpCategory(
            enquiry
          ) === "Upcoming"
      ).length;

    const joined =
      enquiries.filter(
        (enquiry) =>
          enquiry.Status ===
            "Joined" ||
          enquiry.Status ===
            "Converted"
      ).length;

    const conversionRate =
      enquiries.length > 0
        ? Math.round(
            (joined /
              enquiries.length) *
              100
          )
        : 0;

    return {
      total: enquiries.length,
      active,
      overdue,
      today,
      upcoming,
      joined,
      conversionRate,
    };
  }, [enquiries]);

  const filteredEnquiries =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      return enquiries.filter(
        (enquiry) => {
          const matchesSearch =
            !keyword ||
            (
              enquiry.Name ?? ""
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              enquiry.Phone ?? ""
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              enquiry.Email ?? ""
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              enquiry.Program ?? ""
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              enquiry.Status ?? ""
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              enquiry.source ?? ""
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              enquiry.assigned_to ??
              ""
            )
              .toLowerCase()
              .includes(keyword);

          const matchesStatus =
            selectedStatus ===
              "All" ||
            enquiry.Status ===
              selectedStatus;

          const matchesFollowUp =
            followUpFilter ===
              "All" ||
            getFollowUpCategory(
              enquiry
            ) === followUpFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesFollowUp
          );
        }
      );
    }, [
      enquiries,
      search,
      selectedStatus,
      followUpFilter,
    ]);

  function handleFormChange(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEditFormChange(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function handleEdit(
    enquiry: Enquiry
  ) {
    setEditId(enquiry.id);

    setEditForm({
      Name: enquiry.Name ?? "",
      Phone: enquiry.Phone ?? "",
      Email: enquiry.Email ?? "",
      Program:
        enquiry.Program ?? "",
      Status:
        enquiry.Status ?? "New",
      Follow_up_date:
        enquiry.Follow_up_date ??
        "",
      Notes: enquiry.Notes ?? "",
      source:
        enquiry.source ?? "",
      assigned_to:
        enquiry.assigned_to ?? "",
      last_contacted:
        enquiry.last_contacted ??
        "",
      trial_date:
        enquiry.trial_date ?? "",
    });

    setShowEditModal(true);
  }

  function handleDelete(
    enquiry: Enquiry
  ) {
    setSelectedEnquiry(enquiry);
    setShowDeleteModal(true);
  }

  function openConvertModal(
    enquiry: Enquiry
  ) {
    setSelectedEnquiry(enquiry);
    setSelectedClass(undefined);
    setSelectedInstructor(
      undefined
    );
    setShowConvertModal(true);
  }

  async function saveEnquiry() {
    if (!form.Name.trim()) {
      alert(
        "Please enter the enquiry name."
      );
      return;
    }

    if (!form.Phone.trim()) {
      alert(
        "Please enter the phone number."
      );
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await supabase
          .from("Enquiries")
          .insert({
            Name: form.Name.trim(),
            Phone:
              form.Phone.trim(),
            Email:
              form.Email.trim() ||
              null,
            Program:
              form.Program.trim() ||
              null,
            Status:
              form.Status || "New",
            Follow_up_date:
              form.Follow_up_date ||
              null,
            Notes:
              form.Notes.trim() ||
              null,
            source:
              form.source.trim() ||
              null,
            assigned_to:
              form.assigned_to.trim() ||
              null,
            last_contacted:
              form.last_contacted ||
              null,
            trial_date:
              form.trial_date ||
              null,
          });

      if (error) {
        throw error;
      }

      setShowNewModal(false);
      setForm({
        ...EMPTY_FORM,
      });

      await loadData();

      alert(
        "Enquiry added successfully."
      );
    } catch (error) {
      console.error(
        "Unable to save enquiry:",
        error
      );

      alert(
        "Unable to save enquiry."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateEnquiry() {
    if (editId === null) {
      return;
    }

    if (!editForm.Name.trim()) {
      alert(
        "Please enter the enquiry name."
      );
      return;
    }

    if (!editForm.Phone.trim()) {
      alert(
        "Please enter the phone number."
      );
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await supabase
          .from("Enquiries")
          .update({
            Name:
              editForm.Name.trim(),
            Phone:
              editForm.Phone.trim(),
            Email:
              editForm.Email.trim() ||
              null,
            Program:
              editForm.Program.trim() ||
              null,
            Status:
              editForm.Status ||
              "New",
            Follow_up_date:
              editForm.Follow_up_date ||
              null,
            Notes:
              editForm.Notes.trim() ||
              null,
            source:
              editForm.source.trim() ||
              null,
            assigned_to:
              editForm.assigned_to.trim() ||
              null,
            last_contacted:
              editForm.last_contacted ||
              null,
            trial_date:
              editForm.trial_date ||
              null,
          })
          .eq("id", editId);

      if (error) {
        throw error;
      }

      setShowEditModal(false);
      setEditId(null);

      await loadData();

      alert(
        "Enquiry updated successfully."
      );
    } catch (error) {
      console.error(
        "Unable to update enquiry:",
        error
      );

      alert(
        "Unable to update enquiry."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEnquiry() {
    if (!selectedEnquiry) {
      return;
    }

    try {
      setDeleting(true);

      const { error } =
        await supabase
          .from("Enquiries")
          .delete()
          .eq(
            "id",
            selectedEnquiry.id
          );

      if (error) {
        throw error;
      }

      setShowDeleteModal(false);
      setSelectedEnquiry(null);

      await loadData();

      alert(
        "Enquiry deleted successfully."
      );
    } catch (error) {
      console.error(
        "Unable to delete enquiry:",
        error
      );

      alert(
        "Unable to delete enquiry."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function markFollowedUp(
    enquiry: Enquiry
  ) {
    try {
      setMarkingFollowUpId(
        enquiry.id
      );

      const { error } =
        await supabase
          .from("Enquiries")
          .update({
            Status: "Follow Up",
            last_contacted:
              getTodayString(),
            Follow_up_date: null,
          })
          .eq("id", enquiry.id);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(
        "Unable to mark enquiry as followed up:",
        error
      );

      alert(
        "Unable to update the follow-up."
      );
    } finally {
      setMarkingFollowUpId(null);
    }
  }

  async function convertStudent() {
    if (
      !selectedEnquiry ||
      !selectedClass ||
      !selectedInstructor
    ) {
      alert(
        "Please select Class and Instructor."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data,
        error,
      } = await supabase
        .from("Students")
        .insert({
          Name:
            selectedEnquiry.Name,
          Phone:
            selectedEnquiry.Phone,
          Email:
            selectedEnquiry.Email,
          Program:
            selectedEnquiry.Program,
          Status: "Active",
          class_id: selectedClass,
          instructor_id:
            selectedInstructor,
          join_date:
            getTodayString(),
          Fees: 0,
          Fees_due: 0,
          fee_status: "Due",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const {
        error: enquiryError,
      } = await supabase
        .from("Enquiries")
        .update({
          Status: "Joined",
          Follow_up_date: null,
        })
        .eq(
          "id",
          selectedEnquiry.id
        );

      if (enquiryError) {
        throw enquiryError;
      }

      setShowConvertModal(false);
      setSelectedEnquiry(null);

      await loadData();

      router.push(
        `/students/${data.id}`
      );
    } catch (error) {
      console.error(
        "Unable to convert enquiry:",
        error
      );

      alert(
        "Unable to convert the enquiry into a student."
      );
    } finally {
      setSaving(false);
    }
  }

  function selectFollowUpFilter(
    filter: FollowUpFilter
  ) {
    setFollowUpFilter(filter);
  }

  function clearFilters() {
    setSearch("");
    setSelectedStatus("All");
    setFollowUpFilter("All");
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedStatus !== "All" ||
    followUpFilter !== "All";

  const summaryCards = [
    {
      label: "Total Enquiries",
      value: summary.total,
      description: `${summary.active} active leads`,
      icon: Users,
      filter: "All" as FollowUpFilter,
      className:
        "border-gray-200 bg-white",
      iconClassName:
        "bg-gray-100 text-gray-700",
    },
    {
      label: "Overdue",
      value: summary.overdue,
      description:
        "Needs immediate attention",
      icon: AlertCircle,
      filter:
        "Overdue" as FollowUpFilter,
      className:
        "border-red-200 bg-red-50/50",
      iconClassName:
        "bg-red-100 text-red-700",
    },
    {
      label: "Due Today",
      value: summary.today,
      description:
        "Follow up today",
      icon: Clock3,
      filter:
        "Today" as FollowUpFilter,
      className:
        "border-amber-200 bg-amber-50/50",
      iconClassName:
        "bg-amber-100 text-amber-700",
    },
    {
      label: "Upcoming",
      value: summary.upcoming,
      description:
        "Scheduled follow-ups",
      icon: CalendarClock,
      filter:
        "Upcoming" as FollowUpFilter,
      className:
        "border-green-200 bg-green-50/50",
      iconClassName:
        "bg-green-100 text-green-700",
    },
    {
      label: "Converted",
      value: summary.joined,
      description: `${summary.conversionRate}% conversion rate`,
      icon: UserPlus,
      filter: null,
      className:
        "border-purple-200 bg-purple-50/50",
      iconClassName:
        "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Enquiry Follow-up Centre"
          description="Track leads, manage follow-ups and convert enquiries into students."
        />

        <button
          type="button"
          onClick={() =>
            setShowNewModal(true)
          }
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          New Enquiry
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(
          (card) => {
            const Icon =
              card.icon;

            const isSelected =
              card.filter !==
                null &&
              followUpFilter ===
                card.filter;

            return (
              <button
                key={card.label}
                type="button"
                onClick={() => {
                  if (
                    card.filter !==
                    null
                  ) {
                    selectFollowUpFilter(
                      card.filter
                    );
                  }
                }}
                className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                  card.className
                } ${
                  card.filter !==
                  null
                    ? "hover:-translate-y-0.5 hover:shadow-md"
                    : "cursor-default"
                } ${
                  isSelected
                    ? "ring-2 ring-black ring-offset-2"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-2.5 ${card.iconClassName}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {card.description}
                </p>
              </button>
            );
          }
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search name, phone, email, program, source or assigned person..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                className="w-full min-w-[170px] appearance-none rounded-xl border border-gray-200 py-2.5 pl-10 pr-8 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "All"
                        ? "All statuses"
                        : status}
                    </option>
                  )
                )}
              </select>
            </div>

            <select
              value={followUpFilter}
              onChange={(event) =>
                setFollowUpFilter(
                  event.target
                    .value as FollowUpFilter
                )
              }
              className="w-full min-w-[180px] rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            >
              <option value="All">
                All follow-ups
              </option>

              <option value="Overdue">
                Overdue
              </option>

              <option value="Today">
                Due today
              </option>

              <option value="Upcoming">
                Upcoming
              </option>

              <option value="No Follow-up">
                No follow-up date
              </option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {
                filteredEnquiries.length
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {enquiries.length}
            </span>{" "}
            enquiries
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {followUpFilter !==
              "All" && (
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                <CheckCircle2
                  size={14}
                />
                {followUpFilter}
              </div>
            )}

            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() =>
                  setViewMode("board")
                }
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === "board"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <LayoutGrid size={15} />
                Board
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("table")
                }
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <List size={15} />
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "board" ? (
        <EnquiryKanban
          loading={loading}
          enquiries={
            filteredEnquiries
          }
          markingFollowUpId={
            markingFollowUpId
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConvert={
            openConvertModal
          }
          onMarkFollowedUp={
            markFollowedUp
          }
        />
      ) : (
        <EnquiryTable
          loading={loading}
          enquiries={
            filteredEnquiries
          }
          markingFollowUpId={
            markingFollowUpId
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConvert={
            openConvertModal
          }
          onMarkFollowedUp={
            markFollowedUp
          }
        />
      )}

      <NewEnquiryModal
        open={showNewModal}
        saving={saving}
        form={form}
        onClose={() => {
          setShowNewModal(false);
          setForm({
            ...EMPTY_FORM,
          });
        }}
        onSave={saveEnquiry}
        onChange={
          handleFormChange
        }
      />

      <EditEnquiryModal
        open={showEditModal}
        saving={saving}
        form={editForm}
        onClose={() => {
          setShowEditModal(false);
          setEditId(null);
        }}
        onSave={updateEnquiry}
        onChange={
          handleEditFormChange
        }
      />

      <DeleteEnquiryModal
        open={showDeleteModal}
        deleting={deleting}
        studentName={
          selectedEnquiry?.Name ??
          ""
        }
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEnquiry(null);
        }}
        onDelete={deleteEnquiry}
      />

      <ConvertStudentModal
        open={showConvertModal}
        classes={classes}
        instructors={instructors}
        selectedClass={
          selectedClass
        }
        selectedInstructor={
          selectedInstructor
        }
        onClose={() => {
          setShowConvertModal(false);
          setSelectedEnquiry(null);
        }}
        onClassChange={
          setSelectedClass
        }
        onInstructorChange={
          setSelectedInstructor
        }
        onConvert={convertStudent}
      />
    </div>
  );
}