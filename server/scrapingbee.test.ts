import { describe, it, expect } from "vitest";

describe("ScrapingBee Amazon API Validation", () => {
  it("should successfully search Amazon using ScrapingBee", async () => {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    
    console.log("Testing ScrapingBee Amazon Search API...");
    console.log("API Key prefix:", apiKey?.substring(0, 10) + "...");

    try {
      // Use ScrapingBee's Amazon Search API endpoint
      const searchQuery = "iPhone 16";
      const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/amazon/search?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(scrapingBeeUrl);
      
      console.log("Response status:", response.status);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      console.log("✅ Successfully fetched Amazon search results");
      console.log("Number of products:", data.products?.length || 0);
      
      expect(data).toBeDefined();
      expect(data.products).toBeDefined();
      expect(data.products.length).toBeGreaterThan(0);
      
      const firstProduct = data.products[0];
      console.log("First product title:", firstProduct.title);
      console.log("First product price:", firstProduct.price);
      
      expect(firstProduct.title).toBeTruthy();
      
    } catch (error: any) {
      console.error("❌ API Error:", error.message);
      throw error;
    }
  }, 30000); // 30 second timeout for API call
});
