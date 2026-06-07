import { NextResponse } from "next/server";
import { updateModelNotes } from "@/lib/googleSheets";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { notes } = await req.json();
    await updateModelNotes(id, String(notes ?? ""));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/watches/[id]]", err);
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  }
}
