import { google } from "googleapis";
import { Readable } from "stream";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const creds = JSON.parse(raw);
  if (creds.private_key) {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

/**
 * Upload a base64 image to Google Drive and return a publicly accessible URL.
 * The file is placed in GOOGLE_DRIVE_FOLDER_ID if set, otherwise Drive root.
 */
export async function uploadPhotoToDrive(
  base64Data: string,
  fileName: string
): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Strip the data URL prefix (data:image/jpeg;base64,…)
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

  // Make the file readable by anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
