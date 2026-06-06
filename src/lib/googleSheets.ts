import { google } from "googleapis";

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

const SEED_WATCHES = [
  {
    id: "rolex-sub-126610ln",
    brand: "Rolex", name: "Submariner Date", reference: "126610LN",
    caseSize: "41mm", movement: "Cal. 3235", powerReserve: "70 hours",
    image: "", recommendation: "The gold standard for a reason. Nothing else has this combination of instant recognizability and genuine wearability.",
    rank: 1,
  },
  {
    id: "rolex-gmt-126710blnr",
    brand: "Rolex", name: "GMT-Master II", reference: "126710BLNR",
    caseSize: "40mm", movement: "Cal. 3285", powerReserve: "70 hours",
    image: "", recommendation: "The Batman. Harder to get than the Sub, but worth understanding why people love it.",
    rank: 2,
  },
  {
    id: "omega-seamaster-diver-300m",
    brand: "Omega", name: "Seamaster Diver 300M", reference: "210.30.42.20.01.001",
    caseSize: "42mm", movement: "Cal. 8800", powerReserve: "55 hours",
    image: "", recommendation: "Bond's watch. The wave-pattern dial is genuinely beautiful in person.",
    rank: 3,
  },
  {
    id: "tudor-blackbay58",
    brand: "Tudor", name: "Black Bay 58", reference: "79030N",
    caseSize: "39mm", movement: "Cal. MT5402", powerReserve: "70 hours",
    image: "", recommendation: "The smart buy. 39mm is the magic number — wears vintage-small in the best possible way.",
    rank: 4,
  },
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
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: SEED_WATCHES.map(watchToRow) },
    });
    return SEED_WATCHES.map((w) => rowToSheetRow(watchToRow(w)));
  }

  return rows.slice(1).map(rowToSheetRow).filter((r) => r.id !== "");
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
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${TAB}!B${rowIdx}:O${rowIdx}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          String(watch.rank), "", "0", "0", "", "",
          watch.brand, watch.name, watch.reference, watch.caseSize,
          watch.movement, watch.powerReserve, watch.image, watch.recommendation,
        ]],
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
