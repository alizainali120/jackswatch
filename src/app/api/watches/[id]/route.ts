import { NextResponse } from "next/server";
import { updateModelNotes, updateModelTopPick, updateModelRank, createVariant } from "@/lib/googleSheets";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reference, label, link } = await req.json();
    if (!reference) return NextResponse.json({ error: "reference is required" }, { status: 400 });
    const variant = await createVariant(id, { reference: String(reference), label: String(label ?? ""), link: link || undefined });
    return NextResponse.json(variant);
  } catch (err) {
    console.error("[POST /api/watches/[id]]", err);
    return NextResponse.json({ error: "Failed to add variant" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const ops: Promise<void>[] = [];
    if (body.notes !== undefined) ops.push(updateModelNotes(id, String(body.notes)));
    if ("topPickVariantId" in body) ops.push(updateModelTopPick(id, body.topPickVariantId ?? null));
    if ("rank" in body) ops.push(updateModelRank(id, body.rank !== null && body.rank !== undefined ? Number(body.rank) : null));
    await Promise.all(ops);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/watches/[id]]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
