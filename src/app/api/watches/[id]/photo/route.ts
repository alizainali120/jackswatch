import { NextResponse } from "next/server";
import { uploadPhotoToDrive } from "@/lib/googleDrive";
import { upsertWristPhotoUrl } from "@/lib/googleSheets";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { photoBase64 } = await req.json();

    if (!photoBase64) {
      return NextResponse.json({ error: "No photo data" }, { status: 400 });
    }

    const fileName = `wrist-${id}-${Date.now()}.jpg`;
    const url = await uploadPhotoToDrive(photoBase64, fileName);
    await upsertWristPhotoUrl(id, url);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/watches/[id]/photo]", err);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
