import { NextResponse } from "next/server";
// Photo upload removed
export async function POST() {
  return NextResponse.json({ error: "Photo upload removed" }, { status: 410 });
}
