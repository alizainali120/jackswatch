import { NextResponse } from "next/server";
import { getAllRows } from "@/lib/googleSheets";
import { DEFAULT_WATCHES } from "@/lib/watchData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getAllRows();

    const watches = DEFAULT_WATCHES.map((w) => {
      const row = rows.find((r) => r.id === w.id);
      return {
        ...w,
        rank: row?.rank || w.rank || 99,
        tier: row?.tier || undefined,
        notes:
          row &&
          (row.fitScore > 0 ||
            row.dialScore > 0 ||
            row.overallNotes ||
            row.wristPhotoUrl)
            ? {
                fitScore: row.fitScore,
                dialScore: row.dialScore,
                overallNotes: row.overallNotes,
                wristPhoto: row.wristPhotoUrl || undefined,
              }
            : undefined,
      };
    }).sort((a, b) => a.rank - b.rank);

    return NextResponse.json(watches);
  } catch (err) {
    console.error("[GET /api/watches]", err);
    return NextResponse.json(
      { error: "Failed to fetch watches" },
      { status: 500 }
    );
  }
}
