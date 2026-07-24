"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NewEnquiryModal from "@/components/enquiries/NewEnquiryModal";
import ConvertStudentModal from "@/components/enquiries/ConvertStudentModal";
import EditEnquiryModal, {
  EditForm,
} from "@/components/enquiries/EditEnquiryModal";
import DeleteEnquiryModal from "@/components/enquiries/DeleteEnquiryModal";
import EnquiryTable, {
  Enquiry,
} from "@/components/enquiries/EnquiryTable";

import {
  Search,
  Plus,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabase";



type Class={
  id:number;
  class_name:string;
};

type Instructor={
  id:number;
  name:string;
};

export default function EnquiriesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);

  const [selectedClass, setSelectedClass] =
    useState<number>();

  const [selectedInstructor, setSelectedInstructor] =
    useState<number>();

  const [showConvertModal, setShowConvertModal] =
    useState(false);

const [showEditModal, setShowEditModal] =
  useState(false);

  const [showDeleteModal, setShowDeleteModal] =
  useState(false);

const [deleting, setDeleting] =
  useState(false);

const [editId, setEditId] =
  useState<number | null>(null);

const [editForm, setEditForm] =
  useState<EditForm>({
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
  });

    const [showNewModal,setShowNewModal]=useState(false);

const [saving,setSaving]=useState(false);

const [form,setForm]=useState({

Name:"",

Phone:"",

Email:"",

Program:"",

Status:"New",

Follow_up_date:"",

Notes:"",

source:"",

assigned_to:"",

last_contacted:"",

trial_date:""

});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      enquiryResult,
      classResult,
      instructorResult,
    ] = await Promise.all([
      supabase
        .from("Enquiries")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("Classes")
        .select("id,class_name"),

      supabase
        .from("Instructors")
        .select("id,name"),
    ]);

    if (!enquiryResult.error) {
      setEnquiries(enquiryResult.data || []);
    }

    if (!classResult.error) {
      setClasses(classResult.data || []);
    }

    if (!instructorResult.error) {
      setInstructors(instructorResult.data || []);
    }

    setLoading(false);
  }

  const filteredEnquiries = useMemo(() => {
    const keyword = search.toLowerCase();

    return enquiries.filter((item) => {
      return (
        (item.Name ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (item.Phone ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (item.Email ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (item.Program ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (item.Status ?? "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [search, enquiries]);



  function openConvertModal(enquiry: Enquiry) {
    setSelectedEnquiry(enquiry);
    setSelectedClass(undefined);
    setSelectedInstructor(undefined);
    setShowConvertModal(true);
  }

const handleEdit = (enquiry: Enquiry) => {
  setEditId(enquiry.id);

  setEditForm({
    Name: enquiry.Name ?? "",
    Phone: enquiry.Phone ?? "",
    Email: enquiry.Email ?? "",
    Program: enquiry.Program ?? "",
    Status: enquiry.Status ?? "New",
    Follow_up_date: enquiry.Follow_up_date ?? "",
    Notes: enquiry.Notes ?? "",
    source: enquiry.source ?? "",
    assigned_to: enquiry.assigned_to ?? "",
    last_contacted: enquiry.last_contacted ?? "",
    trial_date: enquiry.trial_date ?? "",
  });

  setShowEditModal(true);
};

const handleDelete = (enquiry: Enquiry) => {
  setSelectedEnquiry(enquiry);
  setShowDeleteModal(true);
};

  async function refresh() {
    await loadData();
  }

function handleFormChange(
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) {
  setForm((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
}

async function saveEnquiry() {
  try {
    setSaving(true);

    const { error } = await supabase.from("Enquiries").insert({
      Name: form.Name,
      Phone: form.Phone,
      Email: form.Email,
      Program: form.Program,
      Status: form.Status,
      Follow_up_date: form.Follow_up_date || null,
      Notes: form.Notes,
      source: form.source || null,
      assigned_to: form.assigned_to || null,
      last_contacted: form.last_contacted || null,
      trial_date: form.trial_date || null,
    });

    if (error) throw error;

    setShowNewModal(false);

    setForm({
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
    });

    await refresh();

    alert("Enquiry added successfully.");
  } catch (err) {
    console.error(err);
    alert("Unable to save enquiry.");
  } finally {
    setSaving(false);
  }
}

function handleEditFormChange(
  e: React.ChangeEvent<
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement
  >
) {
  setEditForm((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
}

async function updateEnquiry() {
  if (editId === null) return;

  try {
    setSaving(true);

    const { error } = await supabase
  .from("Enquiries")
  .update({
    Name: editForm.Name,
    Phone: editForm.Phone,
    Email: editForm.Email,
    Program: editForm.Program,
    Status: editForm.Status,
    Follow_up_date: editForm.Follow_up_date || null,
    Notes: editForm.Notes,
    source: editForm.source || null,
    assigned_to: editForm.assigned_to || null,
    last_contacted: editForm.last_contacted || null,
    trial_date: editForm.trial_date || null,
  })
  .eq("id", editId);

    if (error) throw error;

    setShowEditModal(false);
    setEditId(null);

    await refresh();

    alert("Enquiry updated successfully.");
  } catch (err) {
    console.error(err);
    alert("Unable to update enquiry.");
  } finally {
    setSaving(false);
  }
}

async function deleteEnquiry() {
  if (!selectedEnquiry) return;

  try {
    setDeleting(true);

    const { error } = await supabase
      .from("Enquiries")
      .delete()
      .eq("id", selectedEnquiry.id);

    if (error) throw error;

    setShowDeleteModal(false);
    setSelectedEnquiry(null);

    await refresh();

    alert("Enquiry deleted successfully.");
  } catch (err) {
    console.error(err);
    alert("Unable to delete enquiry.");
  } finally {
    setDeleting(false);
  }
}

  return (
    <div className="space-y-6">

      <PageHeader
        title="Enquiries"
        description="Manage leads and convert them into students."
      />

      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border pl-10 pr-4 py-2"
          />

        </div>

        <button
  onClick={() => setShowNewModal(true)}
  className="bg-black text-white rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-800"
>
  <Plus size={18} />
  New Enquiry
</button>

      </div>

      <EnquiryTable
  loading={loading}
  enquiries={filteredEnquiries}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onConvert={openConvertModal}
/>

<NewEnquiryModal
  open={showNewModal}
  saving={saving}
  form={form}
  onClose={() => setShowNewModal(false)}
  onSave={saveEnquiry}
  onChange={handleFormChange}
/>

<EditEnquiryModal
  open={showEditModal}
  saving={saving}
  form={editForm}
  onClose={() => setShowEditModal(false)}
  onSave={updateEnquiry}
  onChange={handleEditFormChange}
/>

<DeleteEnquiryModal
  open={showDeleteModal}
  deleting={deleting}
  studentName={selectedEnquiry?.Name ?? ""}
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
  selectedClass={selectedClass}
  selectedInstructor={selectedInstructor}
  onClose={() => setShowConvertModal(false)}
  onClassChange={setSelectedClass}
  onInstructorChange={setSelectedInstructor}
  onConvert={async () => {
    if (
      !selectedEnquiry ||
      !selectedClass ||
      !selectedInstructor
    ) {
      alert("Please select Class and Instructor.");
      return;
    }


    const { data, error } = await supabase
      .from("Students")
      .insert({
        Name: selectedEnquiry.Name,
        Phone: selectedEnquiry.Phone,
        Email: selectedEnquiry.Email,
        Program: selectedEnquiry.Program,
        Status: "Active",
        class_id: selectedClass,
        instructor_id: selectedInstructor,
        join_date: new Date().toISOString().split("T")[0],
        Fees: 0,
        Fees_due: 0,
        fee_status: "Due",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("Enquiries")
      .update({
        Status: "Joined",
      })
      .eq("id", selectedEnquiry.id);

    setShowConvertModal(false);

    await refresh();

    router.push(`/students/${data.id}`);
  }}
/>
</div>

);
}
