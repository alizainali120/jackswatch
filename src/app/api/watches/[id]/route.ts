import { NextResponse } from "next/server";
import { updateModelNotes, updateModelReactionTags, updateModelTopPick, updateModelRank } from "@/lib/googleSheets";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const ops: Promise<void>[] = [];
    if (body.notes !== undefined) ops.push(updateModelNotes(id, String(body.notes)));
    if (body.reactionTags !== undefined) ops.push(updateModelReactionTags(id, body.reactionTags));
    if ("topPickVariantId" in body) ops.push(updateModelTopPick(id, body.topPickVariantId ?? null));
    if ("rank" in body) ops.push(updateModelRank(id, body.rank !== null && body.rank !== undefined ? Number(body.rank) : null));
    await Promise.all(ops);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/watches/[id]]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
