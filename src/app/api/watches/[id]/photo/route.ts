import { NextResponse } from "next/server";
import { uploadPhotoToDrive } from "@/lib/googleDrive";
import { updateModelHeroImage } from "@/lib/googleSheets";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { image } = await req.json() as { image: string };
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    const url = await uploadPhotoToDrive(image, `${id}-${Date.now()}.jpg`);
    await updateModelHeroImage(id, url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/watches/[id]/photo]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
