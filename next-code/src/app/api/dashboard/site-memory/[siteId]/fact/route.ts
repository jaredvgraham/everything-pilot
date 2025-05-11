import { NextRequest, NextResponse } from "next/server";
import SiteMemory from "@/app/backend/models/siteMemoryModel";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Parse siteId from the URL pathname
  const { pathname } = new URL(req.url);
  const match = pathname.match(/site-memory\/([^/]+)\/fact/);
  const siteId = match ? match[1] : null;
  let fact;
  try {
    const body = await req.json();
    fact = body.fact;
  } catch {
    return NextResponse.json({ error: "Missing fact" }, { status: 400 });
  }
  if (!siteId || !fact)
    return NextResponse.json(
      { error: "Missing siteId or fact" },
      { status: 400 }
    );
  const siteMemory = await SiteMemory.findOne({ userId, siteId });
  if (!siteMemory)
    return NextResponse.json({ error: "No site memory" }, { status: 404 });
  siteMemory.facts = siteMemory.facts.filter((f: string) => f !== fact);
  siteMemory.lastUpdated = new Date();
  await siteMemory.save();
  return NextResponse.json({
    facts: siteMemory.facts,
    lastUpdated: siteMemory.lastUpdated,
  });
}
