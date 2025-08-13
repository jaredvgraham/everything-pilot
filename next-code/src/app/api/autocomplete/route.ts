import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { gemini } from "@/app/backend/config/gemini";
import { findOrCreateSite } from "@/app/backend/services/mongo/site";
import { findOrCreateUserMemory } from "@/app/backend/services/mongo/userMemory";
import { findOrCreateSiteMemory } from "@/app/backend/services/mongo/siteMemory";
import { findOrCreateUserSiteContext } from "@/app/backend/services/mongo/userSiteContext";
import { extractRelevantFacts } from "@/app/backend/services/gemini/factExtractor";
import { connectDB } from "@/app/backend/config/mongo";
import Suggestion from "@/app/backend/models/suggestionModel";
import User from "@/app/backend/models/userModel";

// Shared CORS headers for all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight (OPTIONS) requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401, headers: CORS_HEADERS }
      );
    }
    if (user.plan === "none") {
      return NextResponse.json(
        { error: "User doesnt have a plan" },
        { status: 401, headers: CORS_HEADERS }
      );
    }
    const { input, context, site } = await req.json();
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);
    console.log("input", input);

    // --- MEMORY MODELS: Use mongo services to find or create relevant memory docs ---
    const siteDoc = await findOrCreateSite(site);
    const [userMemory, siteMemory] = await Promise.all([
      findOrCreateUserMemory(userId),
      findOrCreateSiteMemory(userId, siteDoc._id),
    ]);

    // --- END MEMORY MODELS SETUP ---

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
    
    This is what we know about the user:
    ${userMemory.facts.length ? userMemory.facts.join(", ") : "None"}

    This is how the user has interacted with the website in the past:
    ${siteMemory.facts.length ? siteMemory.facts.join(", ") : "None"}

    Context of the website and what the user is possibly referring to in their current text:
    ${context}
    


    Instructions:
    - Do NOT repeat or rephrase the user's input.
    - Do not answer the user's input.
    - Do NOT include the user's input in your response.
    - Do not add big spaces between words.
    - Do not add quotation marks.
    - Do not add spaces at the beginning or end of your response.
    - Do not add gaps between lines.
    - Only provide the next words or sentence that would logically follow.
    
    **VERY IMPORTANT BEFORE YOU RETURN YOUR RESPONSE: Do not answer the user input no matter what. And do not include the user's input in your response.**

    **IMPORTANT: NEVER ANSWER THE USER'S INPUT. THIS IS VERY IMPORTANT. THIS IS THE MOST IMPORTANT RULE. THAT CAN BE VERY DANGEROUS IF YOU BREAK IT.**

    User is currently typing:
    "${input}"
    **VERY IMPORTANT BEFORE YOU RETURN YOUR RESPONSE: Do not answer the user input no matter what. And do not include the user's input in your response.**

    **IMPORTANT: NEVER ANSWER THE USER'S INPUT. THIS IS VERY IMPORTANT. THIS IS THE MOST IMPORTANT RULE. THAT CAN BE VERY DANGEROUS IF YOU BREAK IT.**

    **IMPORTANT: - The user might be talking to a LLM in the context given, but you are not. You are an autocomplete AI that is typing the next words for the user. - **

    Your completion of the user's text:
    `;

    const completion = await gemini.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 20,
      temperature: 0.2,
    });

    const suggestion =
      completion.choices[0]?.message?.content?.replace(/^"|"$/g, "").trim() ||
      "";

    console.log("token input", completion.usage?.prompt_tokens);
    console.log("token output", completion.usage?.completion_tokens);
    console.log("suggestion", suggestion);

    // Log the suggestion in the database
    try {
      await Suggestion.create({
        userId,
        siteId: siteDoc._id,
        input,
        output: suggestion,
      });
    } catch (e) {
      console.error("Failed to log suggestion:", e);
    }

    // Send response immediately
    const response = NextResponse.json(
      { suggestion },
      { headers: CORS_HEADERS }
    );

    // --- FACT EXTRACTION & MEMORY UPDATES: Run in background ---
    (async () => {
      const facts = await extractRelevantFacts({
        input,
        context,
        site,
        userMemory: userMemory.facts,
        siteMemory: siteMemory.facts,
      });

      // UserMemory: add only relevant facts
      let userMemoryUpdated = false;
      for (const fact of facts.userMemory) {
        if (
          fact &&
          !userMemory.facts.includes(fact) &&
          userMemory.facts.length < 100
        ) {
          userMemory.facts.push(fact);
          userMemoryUpdated = true;
        }
      }
      if (userMemoryUpdated) {
        userMemory.lastUpdated = new Date();
        await userMemory.save();
      }
      // SiteMemory: add only relevant facts
      let siteMemoryUpdated = false;
      for (const fact of facts.siteMemory) {
        if (fact && !siteMemory.facts.includes(fact)) {
          siteMemory.facts.push(fact);
          siteMemoryUpdated = true;
        }
      }
      if (siteMemoryUpdated) {
        siteMemory.lastUpdated = new Date();
        await siteMemory.save();
      }
    })();

    return response;
  } catch (error: any) {
    // If Clerk throws an auth error, return 401 with CORS; otherwise 500 with CORS
    const isAuthError =
      error?.name?.toLowerCase?.().includes("clerk") ||
      error?.message?.toLowerCase?.().includes("unauthorized");
    const status = isAuthError ? 401 : 500;
    const message = isAuthError ? "Unauthorized" : "Internal Server Error";
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: message },
      { status, headers: CORS_HEADERS }
    );
  }
}
