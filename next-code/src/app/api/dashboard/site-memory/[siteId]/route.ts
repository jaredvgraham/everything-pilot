import { NextRequest, NextResponse } from "next/server";
import SiteMemory from "@/app/backend/models/siteMemoryModel";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { siteId } = params;
  if (!siteId)
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  const result = await SiteMemory.deleteOne({ userId, siteId });
  if (result.deletedCount === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
