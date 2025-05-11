import { NextRequest, NextResponse } from "next/server";
import UserMemory from "@/app/backend/models/userMemoryModel";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userMemory = await UserMemory.findOne({ userId });
  if (!userMemory)
    return NextResponse.json({ error: "No user memory" }, { status: 404 });
  userMemory.facts = [];
  userMemory.lastUpdated = new Date();
  await userMemory.save();
  return NextResponse.json({
    facts: userMemory.facts,
    lastUpdated: userMemory.lastUpdated,
  });
}
