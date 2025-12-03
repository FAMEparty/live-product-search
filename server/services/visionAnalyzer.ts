import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: "proj_rPUuo2BAGrK1t4HaiTfP0P8h",
  organization: "org-TaP0U1FGn60RP399QF3aNXm8",
});

export async function analyzeProductImage(base64Image: string): Promise<string> {
  // Remove data URL prefix if present
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // GPT-4 Vision model
    messages: [
      {
        role: "system",
        content: `You are a product identification expert for live auction streams.
Analyze product images and extract the exact product name, brand, and model number.
Focus on reading text from packaging, labels, and product markings.
Return ONLY the clean product name suitable for Amazon search.

Examples:
- If you see "Philips Norelco OneBlade QP4631/90" on the box → return "Philips Norelco OneBlade QP4631/90"
- If you see "Nike Air Max 270" on the shoe box → return "Nike Air Max 270"
- If you see "Apple iPhone 16 128GB" → return "Apple iPhone 16 128GB"

Be precise and include model numbers when visible.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What product is this? Extract the exact brand, name, and model number.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`,
              detail: "high", // Use high detail for better text recognition
            },
          },
        ],
      },
    ],
    max_tokens: 100,
    temperature: 0.2, // Lower temperature for more consistent extraction
  });

  const extractedName = response.choices[0].message.content?.trim() || "";
  return extractedName;
}
