import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: "proj_rPUuo2BAGrK1t4HaiTfP0P8h",
  organization: "org-TaP0U1FGn60RP399QF3aNXm8",
});

export async function extractProductName(spokenText: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a product name extractor for live auction streams. 
Extract the product brand, model name, and specific model numbers/variants from conversational speech.
Remove filler words, greetings, and unnecessary details.
PRESERVE important details like model numbers (360, 9000, etc.) and specific variants.
Return ONLY the clean product name suitable for Amazon search.

Examples:
Input: "hey guys, today we're going to be doing a Phillips Norelco one-blade 360 blade face and body"
Output: Philips Norelco OneBlade 360

Input: "alright folks, next up we have the Apple AirPods Pro second generation"
Output: Apple AirPods Pro 2nd Generation

Input: "okay so this is a Nike Air Max 270 in black and white"
Output: Nike Air Max 270

Input: "we have the Norelco shaver 9000 prestige ultra"
Output: Philips Norelco Shaver 9000 Prestige`,
      },
      {
        role: "user",
        content: spokenText,
      },
    ],
    max_tokens: 50,
    temperature: 0.3, // Lower temperature for more consistent extraction
  });

  const extractedName = response.choices[0].message.content?.trim() || spokenText;
  return extractedName;
}
