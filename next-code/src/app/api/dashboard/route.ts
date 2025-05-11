import { NextRequest, NextResponse } from "next/server";
import UserMemory from "@/app/backend/models/userMemoryModel";
import SiteMemory from "@/app/backend/models/siteMemoryModel";
import Site from "@/app/backend/models/siteModel";
import SessionMemory from "@/app/backend/models/sessionMemoryModel";
import Suggestion from "@/app/backend/models/suggestionModel";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
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

    // Count total completions from all session memories
    const sessionMemories = await SessionMemory.find({ userId });
    let requestCount = 0;
    sessionMemories.forEach((session) => {
      requestCount += Array.isArray(session.recentCompletions)
        ? session.recentCompletions.length
        : 0;
    });

    // Count completions in the last month using Suggestion model
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyCompletions = await Suggestion.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    return NextResponse.json({
      requestCount,
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
