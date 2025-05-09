import { auth, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend"; // ✅ correct method
import { openai } from "@/app/backend/config/chatgpt";
import { gemini } from "@/app/backend/config/gemini";

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

    const systemPrompt = `
    You are an autocomplete AI. Your ONLY job is to continue the user's text as naturally as possible, as if you are typing the next words for them.
    
    CRITICAL RULES:
    - NEVER answer the user's input or question
    - NEVER rephrase or repeat what the user has typed
    - NEVER include the user's input in your response
    - ONLY provide the next few words or sentence that would naturally follow
    - If the user is asking a question, DO NOT answer it - just continue their typing
    - If the user is making a statement, DO NOT respond to it - just continue their thought
    
    Examples:
    User: "What is the best way to"
    Correct: "learn programming for someone who has no experience?"
    Wrong: "The best way to learn programming is to start with the basics"
    
    User: "I think we should"
    Correct: "consider all options before making a decision"
    Wrong: "You're right, we should consider all options"
    
    User: "Can you help me with"
    Correct: "this problem I'm having"
    Wrong: "I'd be happy to help you with your problem"
    
    Format:
    - No gaps between lines
    - Just the continuation text`;

    const userPrompt = `
    The user is currently on the following website:
    ${site}
    
    Context of the website and what the user is possibly referring to in their text:
    ${context}
    
    User is currently typing:
    "${input}"

    Instructions:
    - Do NOT repeat or rephrase the user's input.
    - Do not answer the user's input.
    - Do NOT include the user's input in your response.
    - Do not add big spaces between words.
    - Do not add quotation marks.
    - Do not add spaces at the beginning or end of your response.
    - Do not add gaps between lines.
    - Only provide the next words or sentence that would logically follow.
    
    Your completion of the user's text:
    `;

    const completion = await gemini.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 50,
      temperature: 0.2,
    });

    const suggestion =
      completion.choices[0]?.message?.content?.replace(/^"|"$/g, "").trim() ||
      "";

    console.log("token usage", completion.usage?.total_tokens);
    console.log("token input", completion.usage?.prompt_tokens);
    console.log("token output", completion.usage?.completion_tokens);
    console.log("suggestion", suggestion);

    return NextResponse.json(
      { suggestion },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
