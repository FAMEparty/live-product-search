import { describe, it, expect } from "vitest";
import OpenAI from "openai";

describe("OpenAI API Key Validation", () => {
  it("should successfully connect to OpenAI API", async () => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Make a simple API call to validate the key
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'API key is valid' if you can read this.",
        },
      ],
      max_tokens: 10,
    });

    expect(response.choices[0].message.content).toBeTruthy();
    expect(response.choices[0].message.content?.toLowerCase()).toContain("valid");
  }, 15000); // 15 second timeout for API call
});
