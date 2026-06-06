import { NextResponse } from "next/server";
import { getAllRows, upsertWatch } from "@/lib/googleSheets";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getAllRows();

    const watches = rows
      .map((row) => {
        let variantPreferences: Record<string, "prefer" | "pass"> | undefined;
        if (row.variantPrefs) {
          try { variantPreferences = JSON.parse(row.variantPrefs); } catch { /* ignore */ }
        }
        const hasNotes = row.fitScore > 0 || row.dialScore > 0 || row.overallNotes || row.wristPhotoUrl || variantPreferences;
        return {
          id: row.id,
          brand: row.brand,
          name: row.name,
          reference: row.reference,
          caseSize: row.caseSize,
          movement: row.movement,
          powerReserve: row.powerReserve,
          image: row.image,
          recommendation: row.recommendation,
          rank: row.rank || 99,
          tier: row.tier || undefined,
          notes: hasNotes
            ? {
                fitScore: row.fitScore,
                dialScore: row.dialScore,
                overallNotes: row.overallNotes,
                wristPhoto: row.wristPhotoUrl || undefined,
                variantPreferences,
              }
            : undefined,
        };
      })
      .sort((a, b) => a.rank - b.rank);

    return NextResponse.json(watches);
  } catch (err) {
    console.error("[GET /api/watches]", err);
    return NextResponse.json({ error: "Failed to fetch watches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || generateId();
    const rank = Number(body.rank) || 99;

    await upsertWatch({
      id,
      rank,
      brand: String(body.brand ?? ""),
      name: String(body.name ?? ""),
      reference: String(body.reference ?? ""),
      caseSize: String(body.caseSize ?? ""),
      movement: String(body.movement ?? ""),
      powerReserve: String(body.powerReserve ?? ""),
      image: String(body.image ?? ""),
      recommendation: String(body.recommendation ?? ""),
    });

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[POST /api/watches]", err);
    return NextResponse.json({ error: "Failed to add watch" }, { status: 500 });
  }
}
