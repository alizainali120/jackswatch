import { google } from "googleapis";

// ── Auth ─────────────────────────────────────────────────────────────────────

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const creds = JSON.parse(raw);
  // Env vars often escape the newlines in the private key
  if (creds.private_key) {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function sheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set");
  return id;
}

async function client() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

// ── Sheet layout ──────────────────────────────────────────────────────────────
// Tab name: "JacksWatch"
// Columns: A=id  B=rank  C=tier  D=fitScore  E=dialScore  F=overallNotes  G=wristPhotoUrl
const TAB = "JacksWatch";
const RANGE = `${TAB}!A:G`;
const HEADERS = ["id", "rank", "tier", "fitScore", "dialScore", "overallNotes", "wristPhotoUrl"];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SheetRow {
  id: string;
  rank: number;
  tier: string;
  fitScore: number;
  dialScore: number;
  overallNotes: string;
  wristPhotoUrl: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureHeaders(
  sheets: Awaited<ReturnType<typeof client>>
): Promise<void> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${TAB}!A1:G1`,
  });
  if (res.data.values?.[0]?.[0] !== "id") {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${TAB}!A1:G1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

async function findRowIndex(
  sheets: Awaited<ReturnType<typeof client>>,
  id: string
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${TAB}!A:A`,
  });
  const col = res.data.values ?? [];
  const idx = col.findIndex((r) => r[0] === id);
  return idx <= 0 ? null : idx + 1; // 1-based; skip header (idx=0)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllRows(): Promise<SheetRow[]> {
  const sheets = await client();
  await ensureHeaders(sheets);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: RANGE,
  });

  const rows = res.data.values ?? [];
  if (rows.length <= 1) return [];

  return rows
    .slice(1)
    .map((row) => ({
      id: row[0] ?? "",
      rank: parseInt(row[1]) || 0,
      tier: row[2] ?? "",
      fitScore: parseInt(row[3]) || 0,
      dialScore: parseInt(row[4]) || 0,
      overallNotes: row[5] ?? "",
      wristPhotoUrl: row[6] ?? "",
    }))
    .filter((r) => r.id !== "");
}

export async function upsertNotes(
  id: string,
  data: {
    tier?: string;
    fitScore: number;
    dialScore: number;
    overallNotes: string;
  }
): Promise<void> {
  const sheets = await client();
  await ensureHeaders(sheets);
  const rowIdx = await findRowIndex(sheets, id);

  if (rowIdx === null) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [id, "", data.tier ?? "", data.fitScore, data.dialScore, data.overallNotes, ""],
        ],
      },
    });
  } else {
    // Update C:F only — don't touch rank (B) or wristPhotoUrl (G)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${TAB}!C${rowIdx}:F${rowIdx}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[data.tier ?? "", data.fitScore, data.dialScore, data.overallNotes]],
      },
    });
  }
}

export async function upsertWristPhotoUrl(
  id: string,
  url: string
): Promise<void> {
  const sheets = await client();
  await ensureHeaders(sheets);
  const rowIdx = await findRowIndex(sheets, id);

  if (rowIdx === null) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: [[id, "", "", 0, 0, "", url]] },
    });
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${TAB}!G${rowIdx}`,
      valueInputOption: "RAW",
      requestBody: { values: [[url]] },
    });
  }
}

export async function updateRanks(
  ranks: { id: string; rank: number }[]
): Promise<void> {
  const sheets = await client();
  await ensureHeaders(sheets);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${TAB}!A:A`,
  });
  const col = res.data.values ?? [];

  const batchData: { range: string; values: string[][] }[] = [];
  const toAppend: string[][] = [];

  for (const { id, rank } of ranks) {
    const idx = col.findIndex((r) => r[0] === id);
    if (idx <= 0) {
      // Not found (or is the header row) — append a new row
      toAppend.push([id, String(rank), "", "0", "0", "", ""]);
    } else {
      batchData.push({
        range: `${TAB}!B${idx + 1}`,
        values: [[String(rank)]],
      });
    }
  }

  if (batchData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: { valueInputOption: "RAW", data: batchData },
    });
  }

  if (toAppend.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: toAppend },
    });
  }
}
