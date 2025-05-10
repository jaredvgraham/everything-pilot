import { gemini } from "@/app/backend/config/gemini";

export async function extractRelevantFacts({
  input,
  context,
  site,
  userMemory,
  siteMemory,
  userSiteContext,
}: {
  input: string;
  context: string;
  site: string;
  userMemory: string[];
  siteMemory: string[];
  userSiteContext: string[];
}) {
  const prompt = `
  Analyze the following user input, context, and site. 
  Return a JSON object with up to three relevant, persistent, and actionable insights for each of these categories.
  
  Known facts we already know:
  - userMemory: ${userMemory.join(", ")}
  - siteMemory: ${siteMemory.join(", ")}
  - userSiteContext: ${userSiteContext.join(", ")}
  
  - userMemory: actionable, persistent facts about the user (e.g., interests, skills, professional background, communication style, habits, frequently discussed topics)
  - siteMemory: actionable, persistent facts about what the user is using the site or app for (e.g., their ongoing purpose, intent, or focus on this site/app)
  - userSiteContext: actionable, persistent facts about what the user has done or is doing on this site/app (e.g., specific actions, interactions, or history)
  
  Guidelines:
  - Each fact should be a concise phrase, maximum 4 words.
  - Generalize facts to be broadly useful and not overly specific to a single event or message.
  - Do not include facts that are already known to us.
  - Do not include generic activity verbs such as "engaging with", "using", "browsing", "reading", "on", etc. Focus on the topic, intent, or object.
  - The fact should stand alone as a meaningful, persistent insight even if the activity verb is removed.
  - Do not include facts that simply state the user is present on or using a site/app.
  - Focus on the purpose, topic, or specific action (e.g., "developer tools", "tech industry discussions", "job searching", "recipe search").
  - Avoid both excessive brevity (e.g., just a single word) and excessive verbosity (e.g., a paragraph).
  - When possible, include specific objects or entities (e.g., (name), (job), (recipe), (task)) and any relevant qualifiers or context.
  - Do not include explanations or justifications outside the fact itself.
  - If nothing is relevant for a category, return an empty array for that category.
  - Do not repeat the same fact in multiple categories.
  
  Negative examples (do not do this):
  - siteMemory: ["engaging with posts on developer tools"] (should be "developer tools" or "opinions on developer tools")
  - userSiteContext: ["responded to the post with 'thats interesting ive been using cursor'"] (should be "shares Cursor experience" or "responds to criticism")
  - userSiteContext: ["currently browsing X"] (Never include this)
  - Any fact longer than 4 words
  
  Positive examples:
  - siteMemory: ["developer tools", "AI tool opinions", "job searching"]
  - userMemory: ["software developer", "AI tool user", "enjoys spicy food"]
  - userSiteContext: ["shares Cursor experience", "building a social media app", "shares vegan recipes"]

  NEVER include:
  - Facts in your response that are already known to us.
  - Only include additional facts that are not already known to us we will append to the existing facts.
  
  Examples:
  ...
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
  console.log("tokens in response", completion.usage?.prompt_tokens);
  console.log("tokens out response", completion.usage?.completion_tokens);

  console.log("raw", raw);
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
