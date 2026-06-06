import { NextResponse } from "next/server";
import { upsertNotes } from "@/lib/googleSheets";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await upsertNotes(id, {
      tier: body.tier ?? "",
      fitScore: Number(body.fitScore) || 0,
      dialScore: Number(body.dialScore) || 0,
      overallNotes: String(body.overallNotes ?? ""),
      variantPrefs: body.variantPrefs ? JSON.stringify(body.variantPrefs) : "",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/watches/[id]/notes]", err);
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  }
}
