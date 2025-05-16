import { NextRequest, NextResponse } from "next/server";
import UserMemory from "@/app/backend/models/userMemoryModel";
import SiteMemory from "@/app/backend/models/siteMemoryModel";
import Site from "@/app/backend/models/siteModel";
import SessionMemory from "@/app/backend/models/sessionMemoryModel";
import Suggestion from "@/app/backend/models/suggestionModel";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/app/backend/config/mongo";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Get user ID from Clerk (or replace with your auth logic)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user memory
    const userMemoryDoc = await UserMemory.findOne({ userId });
    const userMemory = userMemoryDoc
      ? {
          facts: userMemoryDoc.facts,
          lastUpdated: userMemoryDoc.lastUpdated,
        }
      : { facts: [], lastUpdated: new Date().toISOString() };

    // Fetch all site memories for the user
    const siteMemoriesDocs = await SiteMemory.find({ userId });
    // Get site names
    const siteIds = siteMemoriesDocs.map((sm) => sm.siteId);
    const sites = await Site.find({ _id: { $in: siteIds } });
    const siteIdToName: Record<string, string> = {};
    sites.forEach((site) => {
      siteIdToName[site._id.toString()] = site.name || site.domain;
    });
    const siteMemories = siteMemoriesDocs.map((sm) => ({
      siteId: sm.siteId.toString(),
      siteName: siteIdToName[sm.siteId.toString()] || sm.siteId.toString(),
      facts: sm.facts,
      lastUpdated: sm.lastUpdated,
    }));

    // Count completions in the last month using Suggestion model
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyCompletions = await Suggestion.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalRequests = await Suggestion.countDocuments({ userId });

    return NextResponse.json({
      requestCount: totalRequests,
      userMemory,
      siteMemories,
      monthlyCompletions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE a single user memory fact
export async function DELETE(req: NextRequest) {
  await connectDB();
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let fact;
  try {
    const body = await req.json();
    fact = body.fact;
  } catch {
    return NextResponse.json({ error: "Missing fact" }, { status: 400 });
  }
  if (!fact)
    return NextResponse.json({ error: "Missing fact" }, { status: 400 });
  const userMemory = await UserMemory.findOne({ userId });
  if (!userMemory)
    return NextResponse.json({ error: "No user memory" }, { status: 404 });
  userMemory.facts = userMemory.facts.filter((f: string) => f !== fact);
  userMemory.lastUpdated = new Date();
  await userMemory.save();
  return NextResponse.json({
    facts: userMemory.facts,
    lastUpdated: userMemory.lastUpdated,
  });
}
