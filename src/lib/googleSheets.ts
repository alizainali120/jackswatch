import { google } from "googleapis";
import { DEFAULT_MODELS } from "@/lib/watchData";
import type { WatchModel, WatchVariant, Reaction } from "@/types/watch";

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
// "models"  : A=id  B=brand  C=name  D=heroImage  E=notes  F=rank
//             G=reactionTags(JSON)  H=topPickVariantId
// "variants": A=id  B=modelId  C=reference  D=label  E=size  F=dialColor
//             G=strapType  H=strapColor  I=condition  J=priceRange  K=link
//             L=reaction
// To reseed: clear data rows (not header) in both tabs.

const MODELS_TAB = "models";
const VARIANTS_TAB = "variants";

const MODELS_HEADERS = ["id", "brand", "name", "heroImage", "notes", "rank", "reactionTags", "topPickVariantId"];
const VARIANTS_HEADERS = [
  "id", "modelId", "reference", "label", "size", "dialColor",
  "strapType", "strapColor", "condition", "priceRange", "link", "reaction",
];

async function ensureTab(
  sheets: Awaited<ReturnType<typeof client>>,
  tabName: string,
  headers: string[]
): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId() });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === tabName);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
    });
  }
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

function rowToModel(row: string[]): Omit<WatchModel, "variants"> {
  let reactionTags: string[] = [];
  try {
    const parsed = JSON.parse(row[6] || "[]");
    reactionTags = Array.isArray(parsed) ? parsed : [];
  } catch {}
  return {
    id: row[0] ?? "",
    brand: row[1] ?? "",
    name: row[2] ?? "",
    heroImage: row[3] ?? "",
    notes: row[4] ?? "",
    rank: row[5] && !isNaN(parseInt(row[5])) ? parseInt(row[5]) : null,
    reactionTags,
    topPickVariantId: row[7] || null,
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
  };
}

function modelToRow(m: Omit<WatchModel, "variants">): string[] {
  return [
    m.id, m.brand, m.name, m.heroImage, m.notes,
    m.rank !== null ? String(m.rank) : "", JSON.stringify(m.reactionTags ?? []), m.topPickVariantId ?? "",
  ];
}

function variantToRow(v: WatchVariant): string[] {
  return [
    v.id, v.modelId, v.reference, v.label, v.size ?? "",
    v.dialColor, v.strapType, v.strapColor, v.condition,
    v.priceRange ?? "", v.link ?? "", v.reaction ?? "",
  ];
}

export async function getAllModels(): Promise<WatchModel[]> {
  const sheets = await client();
  await ensureTab(sheets, MODELS_TAB, MODELS_HEADERS);
  await ensureTab(sheets, VARIANTS_TAB, VARIANTS_HEADERS);

  const [modelsRes, variantsRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId(), range: `${MODELS_TAB}!A:H` }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId(), range: `${VARIANTS_TAB}!A:L` }),
  ]);

  const modelRows = (modelsRes.data.values ?? []).slice(1).filter((r) => r[0]);
  const variantRows = (variantsRes.data.values ?? []).slice(1).filter((r) => r[0]);

  if (modelRows.length === 0) {
    const allModelRows = DEFAULT_MODELS.map((m) => modelToRow(m));
    const allVariantRows = DEFAULT_MODELS.flatMap((m) => m.variants.map(variantToRow));
    await Promise.all([
      sheets.spreadsheets.values.append({
        spreadsheetId: sheetId(),
        range: `${MODELS_TAB}!A:H`,
        valueInputOption: "RAW",
        requestBody: { values: allModelRows },
      }),
      sheets.spreadsheets.values.append({
        spreadsheetId: sheetId(),
        range: `${VARIANTS_TAB}!A:L`,
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
    .sort((a, b) => {
      if (a.rank === null && b.rank === null) return 0;
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank;
    });
}

export async function updateModelNotes(id: string, notes: string): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, MODELS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${MODELS_TAB}!E${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[notes]] },
  });
}

export async function updateModelReactionTags(id: string, tags: string[]): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, MODELS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${MODELS_TAB}!G${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[JSON.stringify(tags)]] },
  });
}

export async function updateModelTopPick(id: string, topPickVariantId: string | null): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, MODELS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${MODELS_TAB}!H${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[topPickVariantId ?? ""]] },
  });
}

export async function updateVariantReaction(id: string, reaction: Reaction | null): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, VARIANTS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${VARIANTS_TAB}!L${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[reaction ?? ""]] },
  });
}

export async function updateModelRank(id: string, rank: number | null): Promise<void> {
  const sheets = await client();
  const rowIdx = await findRowIndex(sheets, MODELS_TAB, id);
  if (rowIdx === null) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${MODELS_TAB}!F${rowIdx}`,
    valueInputOption: "RAW",
    requestBody: { values: [[rank !== null ? String(rank) : ""]] },
  });
}

export async function createModel(
  brand: string,
  name: string,
  variants: { reference: string; label: string; link?: string }[]
): Promise<WatchModel> {
  const sheets = await client();
  await ensureTab(sheets, MODELS_TAB, MODELS_HEADERS);
  await ensureTab(sheets, VARIANTS_TAB, VARIANTS_HEADERS);

  const modelId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newModel: WatchModel = {
    id: modelId,
    brand,
    name,
    heroImage: "",
    notes: "",
    rank: null,
    reactionTags: [],
    topPickVariantId: null,
    variants: variants.map((v, i) => ({
      id: `v_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      modelId,
      reference: v.reference,
      label: v.label,
      size: undefined,
      dialColor: "",
      strapType: "bracelet",
      strapColor: "",
      condition: "new",
      priceRange: undefined,
      link: v.link || undefined,
      reaction: null,
    })),
  };

  await Promise.all([
    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: `${MODELS_TAB}!A:H`,
      valueInputOption: "RAW",
      requestBody: { values: [modelToRow(newModel)] },
    }),
    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: `${VARIANTS_TAB}!A:L`,
      valueInputOption: "RAW",
      requestBody: { values: newModel.variants.map(variantToRow) },
    }),
  ]);

  return newModel;
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
      batchData.push({ range: `${MODELS_TAB}!F${idx + 1}`, values: [[String(rank)]] });
    }
  }
  if (batchData.length === 0) return;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId(),
    requestBody: { valueInputOption: "RAW", data: batchData },
  });
}
