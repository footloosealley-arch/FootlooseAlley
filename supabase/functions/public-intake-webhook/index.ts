import { createClient } from "npm:@supabase/supabase-js@2.110.8";

type IntakePayload = {
  kind?: unknown;
  responseId?: unknown;
  submittedAt?: unknown;
  fields?: unknown;
};

type IntakeFields = Record<string, string>;

const allowedPhotoTypes: Record<
  string,
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const maximumPhotoBytes =
  5 * 1024 * 1024;

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: jsonHeaders,
    },
  );
}

function normalizeFieldName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeFields(
  value: unknown,
): IntakeFields {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(
      value as Record<string, unknown>,
    ).map(([key, fieldValue]) => [
      normalizeFieldName(key),
      Array.isArray(fieldValue)
        ? fieldValue.join(", ").trim()
        : String(fieldValue ?? "").trim(),
    ]),
  );
}

function readField(
  fields: IntakeFields,
  aliases: string[],
): string {
  for (const alias of aliases) {
    const value =
      fields[normalizeFieldName(alias)];

    if (value) {
      return value;
    }
  }

  return "";
}

function optionalText(
  value: string,
): string | null {
  const cleanedValue = value.trim();

  return cleanedValue
    ? cleanedValue
    : null;
}

function normalizePhone(
  value: string,
): string {
  let digits = value.replace(/\D/g, "");

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    digits = digits.slice(2);
  }

  if (
    digits.length === 11 &&
    digits.startsWith("0")
  ) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    throw new Error(
      "Enter a valid 10-digit Indian mobile number.",
    );
  }

  return digits;
}

function normalizeEmail(
  value: string,
): string | null {
  const cleanedValue =
    value.trim().toLowerCase();

  if (!cleanedValue) {
    return null;
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      cleanedValue,
    )
  ) {
    throw new Error(
      "The submitted email address is invalid.",
    );
  }

  return cleanedValue;
}

function normalizeDate(
  value: string,
): string | null {
  const cleanedValue = value.trim();

  if (!cleanedValue) {
    return null;
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      cleanedValue,
    )
  ) {
    return cleanedValue;
  }

  const match = cleanedValue.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
  );

  if (!match) {
    throw new Error(
      "A submitted date is invalid.",
    );
  }

  const [, day, month, year] = match;

  return `${year}-${month.padStart(
    2,
    "0",
  )}-${day.padStart(2, "0")}`;
}

function normalizeGender(
  value: string,
): string | null {
  const cleanedValue = value.trim();

  if (!cleanedValue) {
    return null;
  }

  const allowedValues = [
    "Male",
    "Female",
    "Other",
    "Prefer not to say",
  ];

  const gender = allowedValues.find(
    (allowedValue) =>
      allowedValue.toLowerCase() ===
      cleanedValue.toLowerCase(),
  );

  if (!gender) {
    throw new Error(
      "The submitted gender value is invalid.",
    );
  }

  return gender;
}

function normalizeBoolean(
  value: string,
  fallback: boolean,
): boolean {
  if (!value.trim()) {
    return fallback;
  }

  return [
    "yes",
    "true",
    "1",
    "enabled",
    "i agree",
  ].includes(value.trim().toLowerCase());
}

function getSubmissionDate(
  submittedAt: unknown,
): string {
  const date =
    typeof submittedAt === "string"
      ? new Date(submittedAt)
      : new Date();

  const validDate =
    Number.isNaN(date.getTime())
      ? new Date()
      : date;

  return validDate
    .toISOString()
    .slice(0, 10);
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname;

    return (
      hostname === "footloose-alley.vercel.app" ||
      (
        hostname.startsWith("footloose-alley-") &&
        hostname.endsWith(".vercel.app")
      ) ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

async function getClientKey(request: Request): Promise<string> {
  const forwardedFor =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const source = `${forwardedFor}|${userAgent}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source),
  );

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: jsonHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed.",
    });
  }

  if (!isAllowedOrigin(request.headers.get("origin"))) {
    return jsonResponse(403, {
      ok: false,
      error: "This form origin is not allowed.",
    });
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL");
  const serviceRoleKey =
    Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return jsonResponse(500, {
      ok: false,
      error:
        "The intake service is not configured.",
    });
  }

  try {
    const contentType =
      request.headers.get(
        "content-type",
      ) ?? "";

    let body: IntakePayload;
    let photoFile: File | null = null;

    if (
      contentType.includes(
        "multipart/form-data",
      )
    ) {
      const formData =
        await request.formData();

      const metadata =
        formData.get("metadata");

      if (
        typeof metadata !== "string"
      ) {
        return jsonResponse(400, {
          ok: false,
          error:
            "Multipart metadata is required.",
        });
      }

      body =
        JSON.parse(
          metadata,
        ) as IntakePayload;

      const submittedPhoto =
        formData.get("photo");

      if (
        submittedPhoto instanceof File &&
        submittedPhoto.size > 0
      ) {
        photoFile = submittedPhoto;
      }
    } else {
      body =
        (await request.json()) as IntakePayload;
    }

    const kind = body.kind;
    const responseId =
      typeof body.responseId === "string" &&
      body.responseId.trim()
        ? body.responseId.trim()
        : `app-${crypto.randomUUID()}`;

    if (
      kind !== "enquiry" &&
      kind !== "student"
    ) {
      return jsonResponse(400, {
        ok: false,
        error:
          "Intake kind must be enquiry or student.",
      });
    }

    if (!responseId) {
      return jsonResponse(400, {
        ok: false,
        error:
          "Google response ID is required.",
      });
    }

    const fields =
      normalizeFields(body.fields);

    if (readField(fields, ["Website"])) {
      return jsonResponse(201, {
        ok: true,
        duplicate: false,
        kind,
      });
    }

    const name = readField(
      fields,
      [
        "Full Name",
        "Student Name",
        "Name",
      ],
    );

    const submittedPhone =
      readField(fields, [
        "Phone Number",
        "Mobile Number",
        "Phone",
      ]);

    const phone =
      normalizePhone(submittedPhone);

    if (!name.trim()) {
      return jsonResponse(400, {
        ok: false,
        error: "Name is required.",
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const clientKey = await getClientKey(request);
    const { data: allowed, error: rateLimitError } =
      await supabase.rpc("allow_public_intake", {
        request_key: clientKey,
        max_submissions: 8,
      });

    if (rateLimitError) {
      throw rateLimitError;
    }

    if (!allowed) {
      return jsonResponse(429, {
        ok: false,
        error:
          "Too many submissions were received. Please wait and try again later.",
      });
    }

    if (kind === "enquiry") {
      if (photoFile) {
        return jsonResponse(400, {
          ok: false,
          error:
            "Photos are only accepted for student registrations.",
        });
      }

      const { data: existingResponse } =
        await supabase
          .from("Enquiries")
          .select("id")
          .eq(
            "google_form_response_id",
            responseId,
          )
          .maybeSingle();

      if (existingResponse) {
        return jsonResponse(200, {
          ok: true,
          duplicate: true,
          kind,
          id: existingResponse.id,
        });
      }

      const {
        data: openEnquiries,
        error: enquiryLookupError,
      } = await supabase
        .from("Enquiries")
        .select("id,Phone,Status");

      if (enquiryLookupError) {
        throw enquiryLookupError;
      }

      const existingEnquiry =
        openEnquiries?.find((enquiry) => {
          const existingPhone =
            String(
              enquiry.Phone ?? "",
            ).replace(/\D/g, "");

          const comparablePhone =
            existingPhone.length >= 10
              ? existingPhone.slice(-10)
              : existingPhone;

          const finishedStatuses = [
            "Joined",
            "Converted",
            "Closed",
            "Not Interested",
          ];

          return (
            comparablePhone === phone &&
            !finishedStatuses.includes(
              String(enquiry.Status ?? ""),
            )
          );
        });

      if (existingEnquiry) {
        return jsonResponse(200, {
          ok: true,
          duplicate: true,
          kind,
          id: existingEnquiry.id,
          message:
            "An active enquiry with this phone number already exists.",
        });
      }

      const ageValue = readField(
        fields,
        ["Age"],
      );

      const parsedAge = ageValue
        ? Number(ageValue)
        : null;

      if (
        parsedAge !== null &&
        (
          !Number.isInteger(parsedAge) ||
          parsedAge < 1 ||
          parsedAge > 120
        )
      ) {
        throw new Error(
          "Age must be between 1 and 120.",
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from("Enquiries")
        .insert({
          Name: name.trim(),
          Phone: phone,
          Email: normalizeEmail(
            readField(fields, ["Email"]),
          ),
          Program:
            optionalText(
              readField(fields, [
                "Program Interested In",
                "Interested Program",
                "Program",
              ]),
            ),
          Status: "New",
          Notes:
            optionalText(
              readField(fields, [
                "Message",
                "Notes",
              ]),
            ),
          source: "Website",
          gender: normalizeGender(
            readField(fields, ["Gender"]),
          ),
          age: parsedAge,
          enquiry_date:
            getSubmissionDate(
              body.submittedAt,
            ),
          google_form_response_id:
            responseId,
          intake_channel: "Footloose Alley App",
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      return jsonResponse(201, {
        ok: true,
        duplicate: false,
        kind,
        id: data.id,
      });
    }

    if (!photoFile) {
      return jsonResponse(400, {
        ok: false,
        error:
          "Student Photo is required.",
      });
    }

    const { data: existingResponse } =
      await supabase
        .from(
          "Student_Intake_Submissions",
        )
        .select("id,status,student_id")
        .eq(
          "google_form_response_id",
          responseId,
        )
        .maybeSingle();

    if (existingResponse) {
      return jsonResponse(200, {
        ok: true,
        duplicate: true,
        kind,
        id: existingResponse.id,
        status: existingResponse.status,
        studentId:
          existingResponse.student_id,
      });
    }

    const {
      data: existingStudents,
      error: studentLookupError,
    } = await supabase
      .from("Students")
      .select("id,Phone");

    if (studentLookupError) {
      throw studentLookupError;
    }

    const matchingStudent =
      existingStudents?.find(
        (student) => {
          const existingPhone =
            String(
              student.Phone ?? "",
            ).replace(/\D/g, "");

          return (
            existingPhone.slice(-10) ===
            phone
          );
        },
      );

    if (matchingStudent) {
      return jsonResponse(200, {
        ok: true,
        duplicate: true,
        kind,
        studentId:
          matchingStudent.id,
        message:
          "A student with this phone number already exists.",
      });
    }

    const {
      data: pendingRegistrations,
      error: pendingLookupError,
    } = await supabase
      .from(
        "Student_Intake_Submissions",
      )
      .select("id,status")
      .eq("normalized_phone", phone)
      .eq("status", "Pending");

    if (pendingLookupError) {
      throw pendingLookupError;
    }

    if (
      pendingRegistrations &&
      pendingRegistrations.length > 0
    ) {
      return jsonResponse(200, {
        ok: true,
        duplicate: true,
        kind,
        id: pendingRegistrations[0].id,
        status: "Pending",
        message:
          "A pending registration with this phone number already exists.",
      });
    }

    let photoPath: string | null =
      null;

    if (photoFile) {
      const extension =
        allowedPhotoTypes[
          photoFile.type
        ];

      if (!extension) {
        return jsonResponse(400, {
          ok: false,
          error:
            "Student photo must be JPG, PNG, or WebP.",
        });
      }

      if (
        photoFile.size >
        maximumPhotoBytes
      ) {
        return jsonResponse(400, {
          ok: false,
          error:
            "Student photo must be 5 MB or smaller.",
        });
      }

      const safeResponseId =
        responseId.replace(
          /[^a-zA-Z0-9_-]/g,
          "_",
        );

      photoPath = [
        "intake",
        safeResponseId,
        `${crypto.randomUUID()}.${extension}`,
      ].join("/");

      const { error: uploadError } =
        await supabase.storage
          .from("student-photos")
          .upload(
            photoPath,
            new Uint8Array(
              await photoFile.arrayBuffer(),
            ),
            {
              contentType:
                photoFile.type,
              upsert: false,
            },
          );

      if (uploadError) {
        throw new Error(
          `Unable to store the student photo: ${uploadError.message}`,
        );
      }
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        "Student_Intake_Submissions",
      )
      .insert({
        google_form_response_id:
          responseId,
        Name: name.trim(),
        Phone: phone,
        normalized_phone: phone,
        Email: normalizeEmail(
          readField(fields, ["Email"]),
        ),
        Program:
          optionalText(
            readField(fields, [
              "Program Interested In",
              "Selected Program",
              "Program",
            ]),
          ),
        date_of_birth: normalizeDate(
          readField(fields, [
            "Date of Birth",
            "DOB",
          ]),
        ),
        gender: normalizeGender(
          readField(fields, ["Gender"]),
        ),
        Address:
          optionalText(
            readField(fields, [
              "Address",
            ]),
          ),
        Emergency_contact:
          optionalText(
            readField(fields, [
              "Emergency Contact",
              "Emergency Contact Number",
            ]),
          ),
        photo_path: photoPath,
        medical_notes:
          optionalText(
            readField(fields, [
              "Medical Notes",
              "Medical Conditions",
            ]),
          ),
        batch:
          optionalText(
            readField(fields, [
              "Preferred Batch",
              "Batch Preference",
            ]),
          ),
        whatsapp_enabled:
          normalizeBoolean(
            readField(fields, [
              "WhatsApp Consent",
              "WhatsApp Updates",
            ]),
            true,
          ),
        notes:
          optionalText(
            readField(fields, [
              "Additional Notes",
              "Notes",
            ]),
          ),
      })
      .select("id,status")
      .single();

    if (error) {
      if (photoPath) {
        await supabase.storage
          .from("student-photos")
          .remove([photoPath]);
      }

      throw error;
    }

    return jsonResponse(201, {
      ok: true,
      duplicate: false,
      kind,
      id: data.id,
      status: data.status,
    });
  } catch (error) {
    console.error(
      "Public app intake failed:",
      error,
    );

    return jsonResponse(400, {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to process the submission.",
    });
  }
});
