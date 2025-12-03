interface AmazonProduct {
  title: string;
  price: string;
  image: string;
  url: string;
  asin?: string;
}

export async function searchAmazonProducts(productName: string): Promise<AmazonProduct[]> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  
  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY is not configured");
  }

  // Use ScrapingBee's Amazon Search API
  const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/amazon/search?api_key=${apiKey}&query=${encodeURIComponent(productName)}`;
  
  const response = await fetch(scrapingBeeUrl);
  
  if (!response.ok) {
    throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  console.log("ScrapingBee raw response:", JSON.stringify(data, null, 2));
  
  if (!data.products || data.products.length === 0) {
    throw new Error(`No products found for: ${productName}`);
  }
  
  // Helper function to validate and extract real image URLs
  const getValidImageUrl = (product: any): string => {
    const imageUrl = product.url_image || product.image || (product.images && product.images[0]);
    
    // Check if it's a valid direct image URL (not a tracking/redirect URL)
    if (imageUrl && (imageUrl.includes('m.media-amazon.com') || imageUrl.includes('images-na.ssl-images-amazon.com'))) {
      return imageUrl;
    }
    
    // Fallback to Unsplash placeholder
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop";
  };
  
  // Filter out sponsored products and return top 5 organic listings
  const organicProducts = data.products.filter((product: any) => !product.is_sponsored);
  
  return organicProducts.slice(0, 5).map((product: any) => ({
    title: product.title || productName,
    price: product.price ? `$${product.price.toFixed(2)}` : "Price unavailable",
    image: getValidImageUrl(product),
    url: product.asin ? `https://www.amazon.com/dp/${product.asin}` : `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`,
    asin: product.asin,
  }));
}

export async function searchAmazonProduct(productName: string): Promise<AmazonProduct> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  
  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY is not configured");
  }

  // Use ScrapingBee's Amazon Search API
  const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/amazon/search?api_key=${apiKey}&query=${encodeURIComponent(productName)}`;
  
  const response = await fetch(scrapingBeeUrl);
  
  if (!response.ok) {
    throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  console.log("ScrapingBee raw response:", JSON.stringify(data, null, 2));
  
  if (!data.products || data.products.length === 0) {
    throw new Error(`No products found for: ${productName}`);
  }
  
  // Get the first (most relevant) product
  const firstProduct = data.products[0];
  
  console.log("Selected product:", firstProduct);
  
  // Format the price (ScrapingBee returns numeric price)
  const formattedPrice = firstProduct.price 
    ? `$${firstProduct.price.toFixed(2)}` 
    : "Price unavailable";
  
  // Construct Amazon product URL
  const productUrl = firstProduct.asin
    ? `https://www.amazon.com/dp/${firstProduct.asin}`
    : `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`;
  
  return {
    title: firstProduct.title || productName,
    price: formattedPrice,
    image: firstProduct.url_image || firstProduct.image || (firstProduct.images && firstProduct.images[0]) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    url: productUrl,
    asin: firstProduct.asin,
  };
}
