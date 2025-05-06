import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  const { userId } = await auth();
  console.log("userId", userId);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("Autocomplete API called");
  try {
    const { input, context, site } = await request.json();

    console.log("context", context);
    console.log("site", site);

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const prompt = `Continue the user's text as if you are the user, not an assistant. Do NOT answer questions or give advice. Only autocomplete the next few words or sentence. User's on the website: ${site} and this is the context (may or may not be relevant): ${
      context || "(none)"
    }
User's text so far: "${input}"
AI's suggestion:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0]?.message?.content || "";
    const tokens = completion.usage?.total_tokens || 0;

    const suggestionWithQuotes = suggestion.replace(/^"|"$/g, "");

    console.log("Suggestion:", suggestion);
    console.log("Tokens:", tokens);

    return NextResponse.json(
      { suggestion: suggestionWithQuotes },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error in autocomplete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
