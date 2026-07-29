/**
 * Footloose Alley Google Forms intake bridge.
 *
 * Attach this script directly to each Google Form.
 * Configure these Script Properties:
 *
 * INTAKE_KIND     enquiry OR student
 * WEBHOOK_URL     Supabase Edge Function URL
 * WEBHOOK_SECRET  The shared webhook secret
 */

function onFormSubmit(event) {
  if (
    !event ||
    !event.response
  ) {
    throw new Error(
      "This handler requires a Google Form submit trigger."
    );
  }

  var properties =
    PropertiesService.getScriptProperties();

  var intakeKind =
    properties.getProperty("INTAKE_KIND");

  var webhookUrl =
    properties.getProperty("WEBHOOK_URL");

  var webhookSecret =
    properties.getProperty(
      "WEBHOOK_SECRET"
    );

  if (
    !intakeKind ||
    !webhookUrl ||
    !webhookSecret
  ) {
    throw new Error(
      "Missing INTAKE_KIND, WEBHOOK_URL, or WEBHOOK_SECRET in Script Properties."
    );
  }

  if (
    intakeKind !== "enquiry" &&
    intakeKind !== "student"
  ) {
    throw new Error(
      "INTAKE_KIND must be enquiry or student."
    );
  }

  var fields = {};
  var photoFileId = null;

  event.response
    .getItemResponses()
    .forEach(function (itemResponse) {
      var item =
        itemResponse.getItem();

      var title =
        item.getTitle();

      var answer =
        itemResponse.getResponse();

      if (
        item.getType().toString() ===
        "FILE_UPLOAD"
      ) {
        if (
          title === "Student Photo" &&
          Array.isArray(answer) &&
          answer.length > 0
        ) {
          photoFileId =
            String(answer[0]);
        }

        return;
      }

      fields[title] =
        Array.isArray(answer)
          ? answer.join(", ")
          : String(answer || "");
    });

  var payload = {
    kind: intakeKind,
    responseId:
      event.response.getId(),
    submittedAt:
      event.response
        .getTimestamp()
        .toISOString(),
    fields: fields,
  };

  var photoBlob = null;

  if (
    intakeKind === "student" &&
    photoFileId
  ) {
    photoBlob =
      getStudentPhotoBlob_(
        photoFileId
      );
  }

  var requestOptions = photoBlob
    ? {
        method: "post",
        headers: {
          "x-footloose-webhook-secret":
            webhookSecret,
        },
        payload: {
          metadata:
            JSON.stringify(payload),
          photo: photoBlob,
        },
        muteHttpExceptions: true,
      }
    : {
        method: "post",
        contentType:
          "application/json",
        headers: {
          "x-footloose-webhook-secret":
            webhookSecret,
        },
        payload:
          JSON.stringify(payload),
        muteHttpExceptions: true,
      };

  var response = UrlFetchApp.fetch(
    webhookUrl,
    requestOptions
  );

  var responseCode =
    response.getResponseCode();

  if (
    responseCode < 200 ||
    responseCode >= 300
  ) {
    throw new Error(
      "Footloose Alley intake failed (" +
        responseCode +
        "): " +
        response.getContentText()
    );
  }
}

/**
 * Reads a Google Forms file upload from Drive.
 * The Drive original remains with the Form response.
 */
function getStudentPhotoBlob_(
  fileId
) {
  var file =
    DriveApp.getFileById(fileId);

  var blob = file.getBlob();

  var allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.indexOf(
      blob.getContentType()
    ) === -1
  ) {
    throw new Error(
      "Student Photo must be JPG, PNG, or WebP."
    );
  }

  if (
    blob.getBytes().length >
    5 * 1024 * 1024
  ) {
    throw new Error(
      "Student Photo must be 5 MB or smaller."
    );
  }

  return blob.setName(
    file.getName()
  );
}

/**
 * Run this once from Apps Script after configuration.
 * It creates the installable Google Form submit trigger.
 */
function installFootlooseIntakeTrigger() {
  var form =
    FormApp.getActiveForm();

  if (!form) {
    throw new Error(
      "Open Apps Script from the Google Form, not from the response Sheet."
    );
  }

  var existingTrigger =
    ScriptApp.getProjectTriggers().some(
      function (trigger) {
        return (
          trigger.getHandlerFunction() ===
          "onFormSubmit"
        );
      }
    );

  if (existingTrigger) {
    Logger.log(
      "The Footloose Alley trigger is already installed."
    );
    return;
  }

  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log(
    "Footloose Alley intake trigger installed."
  );
}
