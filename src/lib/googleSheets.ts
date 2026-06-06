import { google } from "googleapis";
import { randomUUID } from "crypto";
import { DEFAULT_WATCHES } from "@/lib/watchData";

// ── Auth ─────────────────────────────────────────────────────────────────────

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
      private_key: private_key
        .replace(/^["']|["']$/g, "")
        .replace(/\\n/g, "\n"),
    },
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
// Tab name : "JacksWatch"
// Columns  : A=id  B=rank  C=tier  D=fitScore  E=dialScore  F=overallNotes
//            G=wristPhotoUrl  H=brand  I=name  J=reference  K=caseSize
//            L=movement  M=powerReserve  N=image  O=recommendation
const TAB = "JacksWatch";
const RANGE = `${TAB}!A:O`;
const HEADERS = [
  "id", "rank", "tier", "fitScore", "dialScore", "overallNotes",
  "wristPhotoUrl", "brand", "name", "reference", "caseSize",
  "movement", "powerReserve", "image", "recommendation",
];


// ── Types ─────────────────────────────────────────────────────────────────────

export interface SheetRow {
  id: string;
  rank: number;
  tier: string;
  fitScore: number;
  dialScore: number;
  overallNotes: string;
  wristPhotoUrl: string;
  brand: string;
  name: string;
  reference: string;
  caseSize: string;
  movement: string;
  powerReserve: string;
  image: string;
  recommendation: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function ensureHeaders(
  sheets: Awaited<ReturnType<typeof client>>
): Promise<void> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${TAB}!A1:O1`,
  });
  if (res.data.values?.[0]?.[0] !== "id") {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${TAB}!A1:O1`,
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
  return idx <= 0 ? null : idx + 1; // 1-based; 0 = header row → skip
}

function rowToSheetRow(row: string[]): SheetRow {
  return {
    id: row[0] ?? "",
    rank: parseInt(row[1]) || 0,
    tier: row[2] ?? "",
    fitScore: parseInt(row[3]) || 0,
    dialScore: parseInt(row[4]) || 0,
    overallNotes: row[5] ?? "",
    wristPhotoUrl: row[6] ?? "",
    brand: row[7] ?? "",
    name: row[8] ?? "",
    reference: row[9] ?? "",
    caseSize: row[10] ?? "",
    movement: row[11] ?? "",
    powerReserve: row[12] ?? "",
    image: row[13] ?? "",
    recommendation: row[14] ?? "",
  };
}

function watchToRow(w: {
  id: string; rank: number; tier?: string; fitScore?: number;
  dialScore?: number; overallNotes?: string; wristPhotoUrl?: string;
  brand: string; name: string; reference: string; caseSize: string;
  movement: string; powerReserve: string; image: string; recommendation: string;
}): string[] {
  return [
    w.id, String(w.rank ?? ""), w.tier ?? "", String(w.fitScore ?? 0),
    String(w.dialScore ?? 0), w.overallNotes ?? "", w.wristPhotoUrl ?? "",
    w.brand, w.name, w.reference, w.caseSize, w.movement,
    w.powerReserve, w.image, w.recommendation,
  ];
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

  if (rows.length <= 1) {
    const seedRows = DEFAULT_WATCHES.map((w) =>
      watchToRow({
        id: w.id, rank: w.rank, tier: "", fitScore: 0,
        dialScore: 0, overallNotes: "", wristPhotoUrl: "",
        brand: w.brand, name: w.name, reference: w.reference,
        caseSize: w.caseSize, movement: w.movement,
        powerReserve: w.powerReserve, image: w.image,
        recommendation: w.recommendation,
      })
    );
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: seedRows },
    });
    return seedRows.map(rowToSheetRow);
  }

  const dataRows = rows.slice(1);
  const idWrites: { range: string; values: string[][] }[] = [];

  const processed = dataRows.map((row, i) => {
    const sheetRow = rowToSheetRow(row);
    // Auto-assign id for rows added directly in the Sheet (has a name but no id)
    if (!sheetRow.id && sheetRow.name) {
      sheetRow.id = `watch-${randomUUID().slice(0, 8)}`;
      idWrites.push({ range: `${TAB}!A${i + 2}`, values: [[sheetRow.id]] });
    }
    return sheetRow;
  });

  if (idWrites.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: { valueInputOption: "RAW", data: idWrites },
    });
  }

  return processed.filter((r) => r.id !== "" && r.name !== "");
}

export async function upsertWatch(watch: {
  id: string; rank: number; brand: string; name: string; reference: string;
  caseSize: string; movement: string; powerReserve: string;
  image: string; recommendation: string;
}): Promise<void> {
  const sheets = await client();
  await ensureHeaders(sheets);
  const rowIdx = await findRowIndex(sheets, watch.id);

  if (rowIdx === null) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: [watchToRow({ ...watch, tier: "", fitScore: 0, dialScore: 0, overallNotes: "", wristPhotoUrl: "" })] },
    });
  } else {
    // Update rank (B) and catalog fields (H:O) only — never touch scores/notes/tier in C:G
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `${TAB}!B${rowIdx}`, values: [[String(watch.rank)]] },
          {
            range: `${TAB}!H${rowIdx}:O${rowIdx}`,
            values: [[
              watch.brand, watch.name, watch.reference, watch.caseSize,
              watch.movement, watch.powerReserve, watch.image, watch.recommendation,
            ]],
          },
        ],
      },
    });
  }
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

  if (rowIdx === null) return; // watch must exist first

  // Update C:F only — leave rank (B), wristPhotoUrl (G), and catalog fields (H:O) untouched
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${TAB}!C${rowIdx}:F${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [data.tier ?? "", data.fitScore, data.dialScore, data.overallNotes],
      ],
    },
  });
}

export async function upsertWristPhotoUrl(
  id: string,
  url: string
): Promise<void> {
  const sheets = await client();
  await ensureHeaders(sheets);
  const rowIdx = await findRowIndex(sheets, id);

  if (rowIdx === null) return; // watch must exist first

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${TAB}!G${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[url]] },
  });
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

  for (const { id, rank } of ranks) {
    const idx = col.findIndex((r) => r[0] === id);
    if (idx > 0) {
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
}
