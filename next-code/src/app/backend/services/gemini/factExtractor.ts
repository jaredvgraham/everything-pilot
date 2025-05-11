import { gemini } from "@/app/backend/config/gemini";

export async function extractRelevantFacts({
  input,
  context,
  site,
  userMemory,
  siteMemory,
}: {
  input: string;
  context: string;
  site: string;
  userMemory: string[];
  siteMemory: string[];
}) {
  console.log("context", context);

  const prompt = `
You are helping build a memory system for a persistent, learning AI chat assistant. This assistant should remember and learn about each user over time to personalize responses, anticipate needs, and provide highly relevant, context-aware assistance.

Your task: Extract the most essential, persistent, and actionable facts from the user's input, context, and site. These facts will be stored as long-term memory for the assistant.

**Instructions:**
- Extract facts that are highly relevant, non-redundant, and likely to remain true over time.
- A persistent fact is any information about the user's identity, roles, ongoing projects, long-term interests, affiliations, or the main purpose for which they are using the site/app. This includes, but is not limited to, their profession, creative pursuits, leadership roles, major goals, and the core focus of their current activities.
- Always extract facts that describe who the user is, what they do, what they are working on, and why they are using the site/app, as long as these are not already known.
- Do NOT include trivial, generic, or one-off actions unless they reveal a persistent pattern or interest.
- Each fact should be concise (1-2 phrases), specific, and actionable.
- Group related observations into a single, clear fact.
- Do NOT restate the same thing in different words.
- Do NOT repeat facts already known (see below).
- If you are unsure whether a fact is useful, include it, but avoid generic or redundant statements.
- If nothing new or relevant is found for a category, return an empty array for that category.

**Categories:**
- userMemory: Persistent facts about the user (e.g., interests, skills, goals, preferences, pain points, communication style, habits, frequently discussed topics, meaningful behavioral patterns)
- siteMemory: Persistent facts about what the user is using the site/app for (e.g., ongoing purpose, intent, or focus). Do NOT include facts already in userMemory. Only include if clearly relevant.

**Known facts:**
- userMemory: ${userMemory.join("; ")}
- siteMemory: ${siteMemory.join("; ")}

**Input:**
- User input: "${input}"
- Context: "${context}"
- Site: "${site}"

**Output format:**
Return a JSON object with this structure:
{
  "userMemory": [<up to 3 new, relevant facts or empty array>],
  "siteMemory": [<up to 3 new, relevant facts or empty array>]
}

If no new, relevant fact is found, return an empty array for that category.
`;

  const completion = await gemini.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content || "";
  console.log("tokens in response", completion.usage?.prompt_tokens);
  console.log("tokens out response", completion.usage?.completion_tokens);

  console.log("raw", raw);
  // Try to extract the JSON from the response
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  let facts = { userMemory: [], siteMemory: [] };
  if (jsonStart !== -1 && jsonEnd !== -1) {
    try {
      facts = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      // fallback: return empty facts
    }
  }
  return facts;
}
