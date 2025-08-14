import { gemini } from "@/app/backend/config/gemini";

export class AutocompleteModelError extends Error {
  public httpStatus: number;
  public code: string;
  public isRateLimit: boolean;
  constructor(
    message: string,
    {
      httpStatus = 502,
      code = "MODEL_UPSTREAM_ERROR",
      isRateLimit = false,
    }: { httpStatus?: number; code?: string; isRateLimit?: boolean } = {}
  ) {
    super(message);
    this.name = "AutocompleteModelError";
    this.httpStatus = httpStatus;
    this.code = code;
    this.isRateLimit = isRateLimit;
  }
}

export async function generateAutocompleteSuggestion({
  input,
  context,
  site,
  userMemoryFacts,
  siteMemoryFacts,
}: {
  input: string;
  context: string;
  site: string;
  userMemoryFacts: string[];
  siteMemoryFacts: string[];
}): Promise<{
  suggestion: string;
  usage?: { promptTokens?: number; completionTokens?: number };
}> {
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
    ${userMemoryFacts.length ? userMemoryFacts.join(", ") : "None"}

    This is how the user has interacted with the website in the past:
    ${siteMemoryFacts.length ? siteMemoryFacts.join(", ") : "None"}

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

  let completion: any;
  try {
    completion = await gemini.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 20,
      temperature: 0.2,
    });
  } catch (err: any) {
    const msg = err?.message || "Gemini completion failed";
    const status = typeof err?.status === "number" ? err.status : 502;
    const code =
      err?.code || (status === 429 ? "RATE_LIMIT" : "MODEL_UPSTREAM_ERROR");
    const isRateLimit = status === 429 || code === "rate_limit_exceeded";
    throw new AutocompleteModelError(msg, {
      httpStatus: isRateLimit ? 429 : status,
      code,
      isRateLimit,
    });
  }

  const suggestion =
    completion.choices[0]?.message?.content?.replace(/^"|"$/g, "").trim() || "";

  const usage = {
    promptTokens: completion.usage?.prompt_tokens,
    completionTokens: completion.usage?.completion_tokens,
  };

  return { suggestion, usage };
}
