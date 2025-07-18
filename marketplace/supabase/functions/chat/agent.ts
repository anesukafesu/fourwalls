import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { createReactAgent } from "npm:@langchain/langgraph/prebuilt";
import { searchForPropertiesTool } from "./search-for-properties.ts";

const tools = [searchForPropertiesTool];

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite-preview-06-17",
  maxOutputTokens: 512,
  temperature: 0,
});

export const agent = createReactAgent({
  llm,
  tools,
});
