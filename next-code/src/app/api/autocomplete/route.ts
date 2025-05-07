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

    const prompt = `
    You are an autocomplete AI. Your job is to continue the user's text as naturally as possible, as if you are typing the next words for them.
    
    Context:
    ${context}
    
    User's input so far:
    "${input}"
    
    Instructions:
    - Do NOT repeat or rephrase the user's input.
    - Do NOT include the user's input in your response.
    - Only provide the next words or sentence that would logically follow.
    - If the user is replying to a message or post, make your completion relevant to that context.
    
    Your completion:
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.2,
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
