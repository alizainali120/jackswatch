import { NextResponse } from "next/server";
import { updateVariantReaction } from "@/lib/googleSheets";
import type { Reaction } from "@/types/watch";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reaction } = await req.json();
    const validReactions: Array<Reaction | null> = ["preferred", "pass", null];
    const r: Reaction | null = validReactions.includes(reaction) ? reaction : null;
    await updateVariantReaction(id, r);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/variants/[id]]", err);
    return NextResponse.json({ error: "Failed to save reaction" }, { status: 500 });
  }
}
