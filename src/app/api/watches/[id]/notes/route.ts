import { NextResponse } from "next/server";
// Replaced by PUT /api/watches/[id]
export async function POST() {
  return NextResponse.json({ error: "Deprecated — use PUT /api/watches/[id]" }, { status: 410 });
}
