import { describe, it, expect } from "vitest";
import OpenAI from "openai";

describe("OpenAI API Connection Test", () => {
  it("should validate API key format and attempt connection", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check if API key exists
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    
    // Check if API key has correct format
    expect(apiKey?.startsWith("sk-")).toBe(true);
    
    console.log("API Key format: Valid");
    console.log("API Key length:", apiKey?.length);
    console.log("API Key prefix:", apiKey?.substring(0, 10) + "...");

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      // Try a minimal API call
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
      });

      console.log("API Response received:", response.choices[0].message.content);
      expect(response.choices[0].message.content).toBeTruthy();
    } catch (error: any) {
      console.error("API Error:", error.message);
      console.error("Error status:", error.status);
      console.error("Error type:", error.type);
      throw error;
    }
  }, 20000);
});
