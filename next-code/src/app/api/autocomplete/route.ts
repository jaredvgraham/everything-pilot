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
import {
  AutocompleteModelError,
  generateAutocompleteSuggestion,
} from "@/app/backend/services/gemini/autocomplete";

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

    let suggestion: string;
    let usage: { promptTokens?: number; completionTokens?: number } | undefined;
    try {
      const result = await generateAutocompleteSuggestion({
        input,
        context,
        site,
        userMemoryFacts: userMemory.facts,
        siteMemoryFacts: siteMemory.facts,
      });
      suggestion = result.suggestion;
      usage = result.usage;
    } catch (modelErr) {
      if (modelErr instanceof AutocompleteModelError) {
        console.error("Gemini service error:", {
          message: modelErr.message,
          code: modelErr.code,
          status: modelErr.httpStatus,
        });
        return NextResponse.json(
          { error: modelErr.code, message: modelErr.message },
          { status: modelErr.httpStatus, headers: CORS_HEADERS }
        );
      }
      throw modelErr;
    }

    console.log("token input", usage?.promptTokens);
    console.log("token output", usage?.completionTokens);
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
