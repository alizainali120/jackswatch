import { google } from "googleapis";
import { Readable } from "stream";

function getAuth() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY;

  if (!client_email || !private_key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY"
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email,
      private_key: private_key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

/**
 * Upload a base64-encoded image to Google Drive.
 * Returns a publicly accessible direct-view URL.
 */
export async function uploadPhotoToDrive(
  base64Data: string,
  fileName: string
): Promise<string> {
  const drive = google.drive({ version: "v3", auth: getAuth() });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "image/jpeg",
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: {
      mimeType: "image/jpeg",
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = res.data.id!;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
