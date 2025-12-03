import { describe, it, expect } from "vitest";
import amazonPaapi from "amazon-paapi";

describe("Amazon PA-API Credentials Validation", () => {
  it("should successfully connect to Amazon PA-API and search for a product", async () => {
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const partnerTag = process.env.AMAZON_ASSOCIATE_TAG;

    expect(accessKey).toBeDefined();
    expect(secretKey).toBeDefined();
    expect(partnerTag).toBeDefined();

    console.log("Testing Amazon PA-API with credentials...");
    console.log("Access Key:", accessKey?.substring(0, 8) + "...");
    console.log("Partner Tag:", partnerTag);

    // Configure the API client
    const commonParameters = {
      AccessKey: accessKey!,
      SecretKey: secretKey!,
      PartnerTag: partnerTag!,
      PartnerType: "Associates",
      Marketplace: "www.amazon.com",
    };

    try {
      // Simple test search for "Nike shoes"
      const requestParameters = {
        Keywords: "Nike shoes",
        SearchIndex: "All",
        ItemCount: 1,
        Resources: [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "Offers.Listings.Price",
        ],
      };

      const response = await amazonPaapi.SearchItems(commonParameters, requestParameters);

      console.log("✅ API Response received");
      expect(response).toBeDefined();
      expect(response.SearchResult).toBeDefined();
      expect(response.SearchResult.Items).toBeDefined();
      expect(response.SearchResult.Items.length).toBeGreaterThan(0);

      const firstItem = response.SearchResult.Items[0];
      console.log("First product:", firstItem.ItemInfo?.Title?.DisplayValue);
      
      expect(firstItem.ItemInfo?.Title?.DisplayValue).toBeTruthy();
    } catch (error: any) {
      console.error("❌ API Error:", error.message);
      console.error("Error details:", error);
      throw error;
    }
  }, 30000); // 30 second timeout for API call
});
