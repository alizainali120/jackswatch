import { NextResponse } from "next/server";
import { updateRanks } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const { order } = await req.json();

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "order must be an array" }, { status: 400 });
    }

    const ranks = (order as string[]).map((id, i) => ({ id, rank: i + 1 }));
    await updateRanks(ranks);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/watches/rank]", err);
    return NextResponse.json(
      { error: "Failed to save rankings" },
      { status: 500 }
    );
  }
}
