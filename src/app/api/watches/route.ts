import { NextResponse } from "next/server";
import { getAllModels, createModel } from "@/lib/googleSheets";

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

export async function POST(req: Request) {
  try {
    const { brand, name, variants } = await req.json();
    if (!brand || !name || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: "brand, name, and at least one variant required" }, { status: 400 });
    }
    const model = await createModel(brand, name, variants);
    return NextResponse.json(model);
  } catch (err) {
    console.error("[POST /api/watches]", err);
    return NextResponse.json({ error: "Failed to create watch" }, { status: 500 });
  }
}
