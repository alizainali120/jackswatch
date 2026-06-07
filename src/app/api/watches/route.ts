import { NextResponse } from "next/server";
import { getAllModels } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getAllModels();
    return NextResponse.json(models);
  } catch (err) {
    console.error("[GET /api/watches]", err);
    return NextResponse.json({ error: "Failed to fetch watches" }, { status: 500 });
  }
}
