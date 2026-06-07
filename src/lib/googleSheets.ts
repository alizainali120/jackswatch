import { google } from "googleapis";
import { DEFAULT_MODELS } from "@/lib/watchData";
import type { WatchModel, WatchVariant, Reaction } from "@/types/watch";

// ── Auth ──────────────────────────────────────────────────────────────────────

function getAuth() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY;
  if (!client_email || !private_key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
  }
  return new google.auth.GoogleAuth({
    credentials: {
      client_email,
      private_key: private_key.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n"),
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
// Sheet "models"  : A=id  B=brand  C=name  D=heroImage  E=recommendation  F=notes  G=rank
// Sheet "variants": A=id  B=modelId  C=reference  D=label  E=size  F=dialColor
//                   G=strapType  H=strapColor  I=condition  J=priceRange  K=link
//                   L=reaction  M=tryAgain

const MODELS_TAB = "models";
const VARIANTS_TAB = "variants";

const MODELS_HEADERS = ["id", "brand", "name", "heroImage", "recommendation", "notes", "rank"];
const VARIANTS_HEADERS = [
  "id", "modelId", "reference", "label", "size", "dialColor",
  "strapType", "strapColor", "condition", "priceRange", "link", "reaction", "tryAgain",
];

// ── Internal helpers ──────────────────────────────────────────────────────────

async function ensureTab(
  sheets: Awaited<ReturnType<typeof client>>,
  tabName: string,
  headers: string[]
): Promise<void> {
  // Ensure the tab exists — create it if not
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId() });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === tabName);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    });
  }
  // Ensure headers are written
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${tabName}!A1`,
  });
  if (res.data.values?.[0]?.[0] !== "id") {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${tabName}!A1:${colLetter(headers.length)}1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

function colLetter(n: number): string {
  return String.fromCharCode(64 + n);
}

async function findRowIndex(
  sheets: Awaited<ReturnType<typeof client>>,
  tab: string,
  id: string
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${tab}!A:A`,
  });
  const col = res.data.values ?? [];
  const idx = col.findIndex((r) => r[0] === id);
  return idx <= 0 ? null : idx + 1;
}

// ── Row parsers ───────────────────────────────────────────────────────────────

function rowToModel(row: string[]): Omit<WatchModel, "variants"> {
  return {
    id: row[0] ?? "",
    brand: row[1] ?? "",
    name: row[2] ?? "",
    heroImage: row[3] ?? "",
    recommendation: row[4] ?? "",
    notes: row[5] ?? "",
    rank: parseInt(row[6]) || 99,
  };
}

function rowToVariant(row: string[]): WatchVariant {
  return {
    id: row[0] ?? "",
    modelId: row[1] ?? "",
    reference: row[2] ?? "",
    label: row[3] ?? "",
    size: row[4] || undefined,
    dialColor: row[5] ?? "",
    strapType: (row[6] as WatchVariant["strapType"]) || "bracelet",
    strapColor: row[7] ?? "",
    condition: (row[8] as WatchVariant["condition"]) || "new",
    priceRange: row[9] || undefined,
    link: row[10] || undefined,
    reaction: (row[11] as Reaction) || null,
    tryAgain: row[12] === "true",
  };
}

function modelToRow(m: Omit<WatchModel, "variants">): string[] {
  return [m.id, m.brand, m.name, m.heroImage, m.recommendation, m.notes, String(m.rank)];
}

function variantToRow(v: WatchVariant): string[] {
  return [
    v.id, v.modelId, v.reference, v.label, v.size ?? "",
    v.dialColor, v.strapType, v.strapColor, v.condition,
    v.priceRange ?? "", v.link ?? "", v.reaction ?? "", String(v.tryAgain),
  ];
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllModels(): Promise<WatchModel[]> {
  const sheets = await client();
  await ensureTab(sheets, MODELS_TAB, MODELS_HEADERS);
  await ensureTab(sheets, VARIANTS_TAB, VARIANTS_HEADERS);

  const [modelsRes, variantsRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId(), range: `${MODELS_TAB}!A:G` }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId(), range: `${VARIANTS_TAB}!A:M` }),
  ]);

  const modelRows = (modelsRes.data.values ?? []).slice(1).filter((r) => r[0]);
  const variantRows = (variantsRes.data.values ?? []).slice(1).filter((r) => r[0]);

  // Seed if empty
  if (modelRows.length === 0) {
    const allModelRows = DEFAULT_MODELS.map((m) => modelToRow(m));
    const allVariantRows = DEFAULT_MODELS.flatMap((m) => m.variants.map(variantToRow));
    await Promise.all([
      sheets.spreadsheets.values.append({
        spreadsheetId: sheetId(),
        range: `${MODELS_TAB}!A:G`,
        valueInputOption: "RAW",
        requestBody: { values: allModelRows },
      }),
      sheets.spreadsheets.values.append({
        spreadsheetId: sheetId(),
        range: `${VARIANTS_TAB}!A:M`,
        valueInputOption: "RAW",
        requestBody: { values: allVariantRows },
      }),
    ]);
    return DEFAULT_MODELS;
  }

  const models = modelRows.map(rowToModel);
  const variants = variantRows.map(rowToVariant);

  return models
    .map((m) => ({ ...m, variants: variants.filter((v) => v.modelId === m.id) }))
    .sort((a, b) => a.rank - b.rank);
}

export async function updateModelNotes(id: string, notes: string): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, MODELS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${MODELS_TAB}!F${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[notes]] },
  });
}

export async function updateVariantReaction(
  id: string,
  reaction: Reaction | null,
  tryAgain: boolean
): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, VARIANTS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${VARIANTS_TAB}!L${rowIdx}:M${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[reaction ?? "", String(tryAgain)]] },
  });
}

export async function saveModelRanks(ranks: { id: string; rank: number }[]): Promise<void> {
  const sheets = await client();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${MODELS_TAB}!A:A`,
  });
  const col = res.data.values ?? [];
  const batchData: { range: string; values: string[][] }[] = [];
  for (const { id, rank } of ranks) {
    const idx = col.findIndex((r) => r[0] === id);
    if (idx > 0) {
      batchData.push({ range: `${MODELS_TAB}!G${idx + 1}`, values: [[String(rank)]] });
    }
  }
  if (batchData.length === 0) return;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId(),
    requestBody: { valueInputOption: "RAW", data: batchData },
  });
}
