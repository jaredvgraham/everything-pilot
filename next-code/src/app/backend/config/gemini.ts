import { OpenAI } from "openai";

export const gemini = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
  apiKey: process.env.GEMINI_API_KEY,
});
