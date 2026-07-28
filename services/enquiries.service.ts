import { supabase } from "@/lib/supabase";

import {
  ENQUIRY_GENDERS,
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
} from "@/types/enquiry";

import type {
  CreateEnquiryInput,
  Enquiry,
  EnquiryFilters,
  EnquiryGender,
  EnquirySource,
  EnquiryStatus,
  EnquirySummary,
  UpdateEnquiryInput,
} from "@/types/enquiry";

export {
  ENQUIRY_GENDERS,
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
};

export type {
  CreateEnquiryInput,
  Enquiry,
  EnquiryFilters,
  EnquiryGender,
  EnquirySource,
  EnquiryStatus,
  EnquirySummary,
  UpdateEnquiryInput,
};

function getLocalDateString(
  date = new Date()
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function cleanOptionalText(
  value: string | null | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleanedValue =
    value.trim();

  return cleanedValue.length > 0
    ? cleanedValue
    : null;
}

function cleanRequiredText(
  value: string,
  fieldName: string
): string {
  const cleanedValue =
    value.trim();

  if (!cleanedValue) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  return cleanedValue;
}

function cleanPhone(
  phone: string
): string {
  const cleanedPhone =
    phone
      .replace(/[^\d+]/g, "")
      .trim();

  if (!cleanedPhone) {
    throw new Error(
      "Phone number is required."
    );
  }

  return cleanedPhone;
}

function validateAge(
  age: number | null | undefined
): number | null {
  if (
    age === null ||
    age === undefined
  ) {
    return null;
  }

  const parsedAge =
    Number(age);

  if (
    !Number.isInteger(parsedAge) ||
    parsedAge < 1 ||
    parsedAge > 120
  ) {
    throw new Error(
      "Age must be a whole number between 1 and 120."
    );
  }

  return parsedAge;
}

function normaliseCreateInput(
  input: CreateEnquiryInput
): CreateEnquiryInput {
  return {
    name: cleanRequiredText(
      input.name,
      "Name"
    ),

    phone: cleanPhone(
      input.phone
    ),

    email: cleanOptionalText(
      input.email
    ),

    gender:
      input.gender ?? null,

    age: validateAge(
      input.age
    ),

    interested_in:
      cleanRequiredText(
        input.interested_in,
        "Interested class"
      ),

    source:
      input.source ?? "Other",

    status:
      input.status ?? "New",

    enquiry_date:
      input.enquiry_date ||
      getLocalDateString(),

    follow_up_date:
      input.follow_up_date ||
      null,

    trial_date:
      input.trial_date ||
      null,

    assigned_to:
      cleanOptionalText(
        input.assigned_to
      ),

    notes:
      cleanOptionalText(
        input.notes
      ),
  };
}

function normaliseUpdateInput(
  input: UpdateEnquiryInput
): UpdateEnquiryInput {
  const cleanedInput:
    UpdateEnquiryInput = {};

  if (
    input.name !== undefined
  ) {
    cleanedInput.name =
      cleanRequiredText(
        input.name,
        "Name"
      );
  }

  if (
    input.phone !== undefined
  ) {
    cleanedInput.phone =
      cleanPhone(
        input.phone
      );
  }

  if (
    input.email !== undefined
  ) {
    cleanedInput.email =
      cleanOptionalText(
        input.email
      );
  }

  if (
    input.gender !== undefined
  ) {
    cleanedInput.gender =
      input.gender;
  }

  if (
    input.age !== undefined
  ) {
    cleanedInput.age =
      validateAge(
        input.age
      );
  }

  if (
    input.interested_in !==
    undefined
  ) {
    cleanedInput.interested_in =
      cleanRequiredText(
        input.interested_in,
        "Interested class"
      );
  }

  if (
    input.source !== undefined
  ) {
    cleanedInput.source =
      input.source;
  }

  if (
    input.status !== undefined
  ) {
    cleanedInput.status =
      input.status;
  }

  if (
    input.enquiry_date !==
    undefined
  ) {
    cleanedInput.enquiry_date =
      input.enquiry_date;
  }

  if (
    input.follow_up_date !==
    undefined
  ) {
    cleanedInput.follow_up_date =
      input.follow_up_date ||
      null;
  }

  if (
    input.trial_date !==
    undefined
  ) {
    cleanedInput.trial_date =
      input.trial_date ||
      null;
  }

  if (
    input.assigned_to !==
    undefined
  ) {
    cleanedInput.assigned_to =
      cleanOptionalText(
        input.assigned_to
      );
  }

  if (
    input.notes !== undefined
  ) {
    cleanedInput.notes =
      cleanOptionalText(
        input.notes
      );
  }

  if (
    input.converted_student_id !==
    undefined
  ) {
    cleanedInput.converted_student_id =
      input.converted_student_id;
  }

  if (
    input.converted_at !==
    undefined
  ) {
    cleanedInput.converted_at =
      input.converted_at;
  }

  return cleanedInput;
}

function throwSupabaseError(
  error:
    | {
        message: string;
      }
    | null,
  fallbackMessage: string
): void {
  if (error) {
    throw new Error(
      error.message ||
        fallbackMessage
    );
  }
}

function isActiveEnquiry(
  enquiry: Enquiry
): boolean {
  return (
    enquiry.status !== "Joined" &&
    enquiry.status !==
      "Not Interested"
  );
}

export const enquiriesService = {
  async getEnquiries():
    Promise<Enquiry[]> {
    const {
      data,
      error,
    } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    throwSupabaseError(
      error,
      "Unable to load enquiries."
    );

    return (
      data ?? []
    ) as Enquiry[];
  },

  async getEnquiryById(
    id: number
  ): Promise<Enquiry> {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new Error(
        "Invalid enquiry ID."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", id)
      .single();

    throwSupabaseError(
      error,
      "Unable to load enquiry."
    );

    if (!data) {
      throw new Error(
        "Enquiry not found."
      );
    }

    return data as Enquiry;
  },

  async createEnquiry(
    input: CreateEnquiryInput
  ): Promise<Enquiry> {
    const enquiryData =
      normaliseCreateInput(
        input
      );

    const {
      data,
      error,
    } = await supabase
      .from("enquiries")
      .insert(enquiryData)
      .select("*")
      .single();

    throwSupabaseError(
      error,
      "Unable to create enquiry."
    );

    if (!data) {
      throw new Error(
        "Enquiry was not created."
      );
    }

    return data as Enquiry;
  },

  async updateEnquiry(
    id: number,
    input: UpdateEnquiryInput
  ): Promise<Enquiry> {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new Error(
        "Invalid enquiry ID."
      );
    }

    const enquiryData =
      normaliseUpdateInput(
        input
      );

    if (
      Object.keys(
        enquiryData
      ).length === 0
    ) {
      return this.getEnquiryById(
        id
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("enquiries")
      .update(enquiryData)
      .eq("id", id)
      .select("*")
      .single();

    throwSupabaseError(
      error,
      "Unable to update enquiry."
    );

    if (!data) {
      throw new Error(
        "Enquiry was not updated."
      );
    }

    return data as Enquiry;
  },

  async deleteEnquiry(
    id: number
  ): Promise<void> {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new Error(
        "Invalid enquiry ID."
      );
    }

    const {
      error,
    } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", id);

    throwSupabaseError(
      error,
      "Unable to delete enquiry."
    );
  },

  async updateStatus(
    id: number,
    status: EnquiryStatus
  ): Promise<Enquiry> {
    return this.updateEnquiry(
      id,
      {
        status,

        converted_at:
          status === "Joined"
            ? new Date().toISOString()
            : null,
      }
    );
  },

  async markAsJoined(
    id: number,
    studentId?:
      | number
      | null
  ): Promise<Enquiry> {
    return this.updateEnquiry(
      id,
      {
        status: "Joined",

        converted_student_id:
          studentId ?? null,

        converted_at:
          new Date().toISOString(),
      }
    );
  },

  async markFollowedUp(
    id: number
  ): Promise<Enquiry> {
    return this.updateEnquiry(
      id,
      {
        status: "Contacted",
        follow_up_date: null,
      }
    );
  },

  calculateSummary(
    enquiries: Enquiry[]
  ): EnquirySummary {
    const today =
      getLocalDateString();

    const total =
      enquiries.length;

    const newCount =
      enquiries.filter(
        (enquiry) =>
          enquiry.status === "New"
      ).length;

    const contacted =
      enquiries.filter(
        (enquiry) =>
          enquiry.status ===
          "Contacted"
      ).length;

    const followUpsToday =
      enquiries.filter(
        (enquiry) =>
          enquiry.follow_up_date ===
            today &&
          isActiveEnquiry(enquiry)
      ).length;

    const overdueFollowUps =
      enquiries.filter(
        (enquiry) =>
          Boolean(
            enquiry.follow_up_date
          ) &&
          enquiry.follow_up_date! <
            today &&
          isActiveEnquiry(enquiry)
      ).length;

    const trialsScheduled =
      enquiries.filter(
        (enquiry) =>
          enquiry.status ===
          "Trial Scheduled"
      ).length;

    const joined =
      enquiries.filter(
        (enquiry) =>
          enquiry.status ===
          "Joined"
      ).length;

    const notInterested =
      enquiries.filter(
        (enquiry) =>
          enquiry.status ===
          "Not Interested"
      ).length;

    const conversionRate =
      total > 0
        ? Math.round(
            (joined / total) *
              100
          )
        : 0;

    return {
      total,
      new: newCount,
      contacted,
      followUpsToday,
      overdueFollowUps,
      trialsScheduled,
      joined,
      notInterested,
      conversionRate,
    };
  },

  filterEnquiries(
    enquiries: Enquiry[],
    filters: EnquiryFilters
  ): Enquiry[] {
    const today =
      getLocalDateString();

    const search =
      filters.search
        ?.trim()
        .toLowerCase();

    return enquiries.filter(
      (enquiry) => {
        const matchesSearch =
          !search ||
          enquiry.name
            .toLowerCase()
            .includes(search) ||
          enquiry.phone
            .toLowerCase()
            .includes(search) ||
          enquiry.email
            ?.toLowerCase()
            .includes(search) ||
          enquiry.interested_in
            .toLowerCase()
            .includes(search) ||
          enquiry.notes
            ?.toLowerCase()
            .includes(search);

        const matchesStatus =
          !filters.status ||
          filters.status ===
            "All" ||
          enquiry.status ===
            filters.status;

        const matchesSource =
          !filters.source ||
          filters.source ===
            "All" ||
          enquiry.source ===
            filters.source;

        let matchesFollowUp =
          true;

        if (
          filters.followUp &&
          filters.followUp !==
            "All"
        ) {
          if (
            filters.followUp ===
            "Today"
          ) {
            matchesFollowUp =
              enquiry.follow_up_date ===
                today &&
              isActiveEnquiry(enquiry);
          }

          if (
            filters.followUp ===
            "Overdue"
          ) {
            matchesFollowUp =
              Boolean(
                enquiry.follow_up_date
              ) &&
              enquiry.follow_up_date! <
                today &&
              isActiveEnquiry(enquiry);
          }

          if (
            filters.followUp ===
            "Upcoming"
          ) {
            matchesFollowUp =
              Boolean(
                enquiry.follow_up_date
              ) &&
              enquiry.follow_up_date! >
                today &&
              isActiveEnquiry(enquiry);
          }
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesSource &&
          matchesFollowUp
        );
      }
    );
  },

  getWhatsAppUrl(
    phone: string,
    name?: string
  ): string {
    let cleanNumber =
      phone.replace(
        /\D/g,
        ""
      );

    if (
      cleanNumber.length === 10
    ) {
      cleanNumber =
        `91${cleanNumber}`;
    }

    const message =
      encodeURIComponent(
        name
          ? `Hi ${name}, this is Footloose Alley Dance & Fitness Studio. We are following up regarding your enquiry. Please let us know how we can assist you.`
          : "Hi, this is Footloose Alley Dance & Fitness Studio. We are following up regarding your enquiry."
      );

    return `https://wa.me/${cleanNumber}?text=${message}`;
  },

  getCallUrl(
    phone: string
  ): string {
    const cleanNumber =
      phone.replace(
        /[^\d+]/g,
        ""
      );

    return `tel:${cleanNumber}`;
  },

  isFollowUpToday(
    enquiry: Enquiry
  ): boolean {
    return (
      enquiry.follow_up_date ===
        getLocalDateString() &&
      isActiveEnquiry(enquiry)
    );
  },

  isFollowUpOverdue(
    enquiry: Enquiry
  ): boolean {
    if (
      !enquiry.follow_up_date ||
      !isActiveEnquiry(enquiry)
    ) {
      return false;
    }

    return (
      enquiry.follow_up_date <
      getLocalDateString()
    );
  },

  isFollowUpUpcoming(
    enquiry: Enquiry
  ): boolean {
    if (
      !enquiry.follow_up_date ||
      !isActiveEnquiry(enquiry)
    ) {
      return false;
    }

    return (
      enquiry.follow_up_date >
      getLocalDateString()
    );
  },
};