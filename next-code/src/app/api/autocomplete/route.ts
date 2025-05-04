import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  console.log("Autocomplete API called");
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are an AI writing assistant. Given the following partial text, suggest a natural and helpful continuation. Only return the next few words or sentence, not the whole message.\n\nText so far: "${input}"\nAI's suggestion:`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0]?.message?.content || "";
    const tokens = completion.usage?.total_tokens || 0;

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error in autocomplete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
