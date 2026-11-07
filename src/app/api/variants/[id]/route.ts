import { NextResponse } from "next/server";
import { updateVariantReaction, updateVariantNotes } from "@/lib/googleSheets";
import type { Reaction } from "@/types/watch";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const ops: Promise<void>[] = [];
    if ("reaction" in body) {
      const validReactions: Array<Reaction | null> = ["preferred", "pass", null];
      const r: Reaction | null = validReactions.includes(body.reaction) ? body.reaction : null;
      ops.push(updateVariantReaction(id, r));
    }
    if (body.notes !== undefined) ops.push(updateVariantNotes(id, String(body.notes)));
    await Promise.all(ops);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/variants/[id]]", err);
    return NextResponse.json({ error: "Failed to save variant" }, { status: 500 });
  }
}
