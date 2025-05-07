import { auth, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend"; // ✅ correct method

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle preflight (OPTIONS) requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Or specific extension origin
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("userId", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { input, context, site } = await req.json();

    console.log("context", context);

    const prompt = `Continue the user's text as if you are the user, not an assistant. Do NOT answer questions or give advice. Only autocomplete the next few words or sentence. User's on the website: ${site} and this is the context (may or may not be relevant): ${
      context || "(none)"
    }
User's text so far: "${input}"
AI's suggestion:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.7,
    });

    const suggestion =
      completion.choices[0]?.message?.content?.replace(/^"|"$/g, "") || "";

    return NextResponse.json(
      { suggestion },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
