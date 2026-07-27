"use client";

import { useEffect, useState } from "react";

import {
  User,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  ClipboardList,
} from "lucide-react";

import {
  Enquiry,
  EnquiryStatus,
} from "@/types/enquiry";


type Props = {

  enquiry?: Enquiry | null;

  onSave: (
    enquiry: Omit<Enquiry, "id" | "created_at">
  ) => Promise<void>;

  onCancel?: () => void;

};



const statuses: EnquiryStatus[] = [

  "New",

  "Contacted",

  "Trial Booked",

  "Joined",

  "Not Interested",

  "Lost",

];



const programs = [

  "Zumba",

  "Dance Fitness",

  "Bollywood",

  "Hip Hop",

  "Kids Dance",

  "Personal Training",

];



const emptyForm = {
  Name: "",
  Phone: "",
  Email: "",
  Program: "",
  Status: "New" as EnquiryStatus,
  Follow_up_date: "",
  Notes: "",
  Source: "",
};




export default function EnquiryForm({

  enquiry,

  onSave,

  onCancel,

}: Props) {


  const [saving,setSaving] =
    useState(false);



  const [form,setForm] =
    useState<
      Omit<Enquiry,"id" | "created_at">
    >(emptyForm);





  useEffect(() => {


    if(enquiry){

      setForm({

        Name: enquiry.Name,

        Phone: enquiry.Phone,

        Email: enquiry.Email ?? "",

        Program: enquiry.Program ?? "",

        Status: enquiry.Status,

        Follow_up_date:
          enquiry.Follow_up_date ?? "",

        Notes:
          enquiry.Notes ?? "",

        Source:
          enquiry.Source ?? "",

      });


    }else{

      setForm(emptyForm);

    }


  },[enquiry]);







  function updateField<K extends keyof typeof form>(

    key: K,

    value:(typeof form)[K]

  ){

    setForm(prev=>({

      ...prev,

      [key]:value,

    }));

  }







  async function handleSubmit(

    e:React.FormEvent<HTMLFormElement>

  ){

    e.preventDefault();



    if(!form.Name.trim()){

      alert(
        "Please enter enquiry name"
      );

      return;

    }



    if(!form.Phone.trim()){

      alert(
        "Please enter phone number"
      );

      return;

    }



    try{


      setSaving(true);


      await onSave(form);



      if(!enquiry){

        setForm(emptyForm);

      }



    }finally{

      setSaving(false);

    }


  }







  return (

    <form

      onSubmit={handleSubmit}

      className="
      space-y-5
      rounded-2xl
      bg-white
      p-6
      shadow-lg
      "

    >


      <h2 className="
      text-2xl
      font-bold
      text-slate-800
      ">

        {enquiry
          ? "Edit Enquiry"
          : "New Enquiry"
        }

      </h2>





      <div>

        <label className="mb-2 flex items-center gap-2 font-medium">

          <User size={18}/>
          Name

        </label>


        <input

          className="w-full rounded-xl border p-3"

          value={form.Name}

          onChange={(e)=>
            updateField(
              "Name",
              e.target.value
            )
          }

        />

      </div>






      <div>

        <label className="mb-2 flex items-center gap-2 font-medium">

          <Phone size={18}/>
          Phone

        </label>


        <input

          className="w-full rounded-xl border p-3"

          value={form.Phone}

          onChange={(e)=>
            updateField(
              "Phone",
              e.target.value
            )
          }

        />

      </div>






      <div>

        <label className="mb-2 flex items-center gap-2 font-medium">

          <Mail size={18}/>
          Email

        </label>


        <input

          type="email"

          className="w-full rounded-xl border p-3"

          value={form.Email ?? ""}

          onChange={(e)=>
            updateField(
              "Email",
              e.target.value
            )
          }

        />

      </div>






      <div>

        <label className="mb-2 flex items-center gap-2 font-medium">

          <BookOpen size={18}/>
          Program

        </label>


        <select

          className="w-full rounded-xl border p-3"

          value={form.Program ?? ""}

          onChange={(e)=>
            updateField(
              "Program",
              e.target.value
            )
          }

        >

          <option value="">
            Select Program
          </option>


          {programs.map(program=>(

            <option key={program}>
              {program}
            </option>

          ))}


        </select>

      </div>







      <div>

        <label className="mb-2 flex items-center gap-2 font-medium">

          <ClipboardList size={18}/>

          Status

        </label>


        <select

          className="w-full rounded-xl border p-3"

          value={form.Status}

          onChange={(e)=>
            updateField(
              "Status",
              e.target.value as EnquiryStatus
            )
          }

        >

          {statuses.map(status=>(

            <option key={status}>

              {status}

            </option>

          ))}


        </select>


      </div>







      <div>

        <label className="mb-2 flex items-center gap-2 font-medium">

          <Calendar size={18}/>

          Follow-up Date

        </label>


        <input

          type="date"

          className="w-full rounded-xl border p-3"

          value={
            form.Follow_up_date ?? ""
          }

          onChange={(e)=>
            updateField(
              "Follow_up_date",
              e.target.value
            )
          }

        />

      </div>







      <div>

        <label className="mb-2 font-medium">

          Notes

        </label>


        <textarea

          rows={4}

          className="w-full rounded-xl border p-3"

          value={
            form.Notes ?? ""
          }

          onChange={(e)=>
            updateField(
              "Notes",
              e.target.value
            )
          }

        />

      </div>







      <div className="flex justify-end gap-3">


        {enquiry && (

          <button

            type="button"

            onClick={onCancel}

            className="
            rounded-xl
            bg-slate-200
            px-6
            py-3
            font-semibold
            "

          >

            Cancel

          </button>

        )}





        <button

          disabled={saving}

          className="
          rounded-xl
          bg-purple-600
          px-6
          py-3
          font-semibold
          text-white
          "

        >

          {saving
            ? "Saving..."
            : enquiry
            ? "Update Enquiry"
            : "Save Enquiry"
          }

        </button>


      </div>


    </form>

  );

}