interface AmazonProduct {
  title: string;
  price: string;
  image: string;
  url: string;
  asin?: string;
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
  
  if (!data.products || data.products.length === 0) {
    throw new Error(`No products found for: ${productName}`);
  }
  
  // Get the first (most relevant) product
  const firstProduct = data.products[0];
  
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
    image: firstProduct.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    url: productUrl,
    asin: firstProduct.asin,
  };
}
