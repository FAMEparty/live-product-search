import { describe, it, expect } from "vitest";
import OpenAI from "openai";

describe("OpenAI API with Project ID", () => {
  it("should connect using project-scoped API key", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    expect(apiKey).toBeDefined();
    expect(apiKey?.startsWith("sk-")).toBe(true);

    const openai = new OpenAI({
      apiKey: apiKey,
      project: "proj_rPUuo2BAGrK1t4HaiTfP0P8h",
      organization: "org-TaP0U1FGn60RP399QF3aNXm8",
    });

    console.log("Testing with project ID: proj_rPUuo2BAGrK1t4HaiTfP0P8h");
    console.log("Testing with org ID: org-TaP0U1FGn60RP399QF3aNXm8");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 10,
      });

      console.log("✅ API Response:", response.choices[0].message.content);
      expect(response.choices[0].message.content).toBeTruthy();
    } catch (error: any) {
      console.error("❌ API Error:", error.message);
      console.error("Error status:", error.status);
      console.error("Error code:", error.code);
      throw error;
    }
  }, 20000);
});
