import { describe, it, expect } from "vitest";
import { extractProductName } from "./services/productExtractor";
import { searchAmazonProduct } from "./services/amazonScraper";

describe("Hybrid Search Workflow", () => {
  it("should extract product name from natural speech and find correct Amazon product", async () => {
    const naturalSpeech = "hey guys, today we're going to be doing a Philips Norelco OneBlade 360 blade face and body";
    
    // Step 1: Extract product name using AI
    const extractedName = await extractProductName(naturalSpeech);
    console.log("Extracted product name:", extractedName);
    
    // Verify extraction contains key terms
    expect(extractedName.toLowerCase()).toContain("philips");
    expect(extractedName.toLowerCase()).toContain("norelco");
    expect(extractedName.toLowerCase()).toContain("oneblade");
    
    // Step 2: Search Amazon with extracted name
    const product = await searchAmazonProduct(extractedName);
    console.log("Found product:", product);
    
    // Verify we got a real product
    expect(product.title).toBeTruthy();
    expect(product.price).toBeTruthy();
    expect(product.url).toContain("amazon.com");
    
    // Verify the product is relevant
    expect(product.title.toLowerCase()).toMatch(/philips|norelco|oneblade/);
  }, 30000); // 30 second timeout for API calls
});
