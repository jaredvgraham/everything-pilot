import { gemini } from "@/app/backend/config/gemini";

export async function extractRelevantFacts({
  input,
  context,
  site,
}: {
  input: string;
  context: string;
  site: string;
}) {
  const prompt = `Analyze the following user input, context, and site. 
Return a JSON object with up to three relevant, persistent facts for each of these categories:
- userMemory: facts about the user (e.g., interests, skills, habits)
- siteMemory: facts about the site/project (e.g., tech stack, purpose, domain)
- userSiteContext: facts about what the user is doing on the site (e.g., current project, goals)

If nothing is relevant for a category, return an empty array for that category.

User input: "${input}"
Context: "${context}"
Site: "${site}"

Output:
`;

  const completion = await gemini.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content || "";
  // Try to extract the JSON from the response
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  let facts = { userMemory: [], siteMemory: [], userSiteContext: [] };
  if (jsonStart !== -1 && jsonEnd !== -1) {
    try {
      facts = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      // fallback: return empty facts
    }
  }
  return facts;
}
