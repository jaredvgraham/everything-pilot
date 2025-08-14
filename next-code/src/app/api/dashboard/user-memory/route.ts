import { NextRequest, NextResponse } from "next/server";
import UserMemory from "@/app/backend/models/userMemoryModel";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/app/backend/config/mongo";
import { findOrCreateUserMemory } from "@/app/backend/services/mongo/userMemory";

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

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let fact: string | undefined;
  try {
    const body = await req.json();
    fact = typeof body?.fact === "string" ? body.fact.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!fact)
    return NextResponse.json({ error: "Missing fact" }, { status: 400 });

  // Optional: basic length validation
  if (fact.length > 500)
    return NextResponse.json(
      { error: "Fact too long (max 500 characters)" },
      { status: 400 }
    );

  const userMemory = await findOrCreateUserMemory(userId);

  // Enforce max capacity of 100 facts
  if (Array.isArray(userMemory.facts) && userMemory.facts.length >= 100) {
    return NextResponse.json(
      {
        error: "User memory is full (100 facts). Delete some to add new ones.",
      },
      { status: 400 }
    );
  }

  // Avoid duplicates (case-insensitive match)
  const exists = (userMemory.facts || []).some(
    (f: string) => f.toLowerCase() === fact!.toLowerCase()
  );
  if (!exists) {
    userMemory.facts.push(fact);
    userMemory.lastUpdated = new Date();
    await userMemory.save();
  }

  return NextResponse.json({
    facts: userMemory.facts,
    lastUpdated: userMemory.lastUpdated,
  });
}
