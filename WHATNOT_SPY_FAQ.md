# Whatnot Spy - FAQ and Troubleshooting Guide

This document provides answers to common questions and solutions to potential issues that may arise during the development of the Whatnot Spy application.

---

## General Questions

### Q1: Should Whatnot Spy be a completely separate repository?

**Answer:** Yes. Whatnot Spy serves a fundamentally different purpose (buying/analyzing vs. selling/displaying) and should be maintained as an independent application. This allows for:
- Separate deployment pipelines
- Different feature roadmaps
- Simplified codebase (no unused OBS/Stream Deck features)
- Easier maintenance and updates

**Repository Name:** `whatnot-spy`  
**GitHub URL:** `https://github.com/FAMEparty/whatnot-spy`

---

### Q2: Can I use the same GitHub account and API keys?

**Answer:** Yes. You can use the same GitHub account to host both repositories. The API keys (OpenAI, ScrapingBee) can also be shared between projects, as they are stored as environment variables and not hard-coded. However, monitor your API usage to ensure you don't exceed rate limits when running both applications simultaneously.

---

### Q3: Should I implement user authentication in the initial version?

**Answer:** No. Keep the initial version stateless to minimize complexity and speed up development. User authentication, saved searches, and product history can be added in a future version (v2.0) if there is demand. The current "Live Product Search" application also started without authentication and added it later.

---

### Q4: How do I test the application without access to live Whatnot streams?

**Answer:** Use recorded Whatnot stream videos from YouTube or save sample streams locally for testing. You can also use static product images to test the vision analysis and Amazon search functionality without needing a live stream. Create a test mode that allows uploading images directly instead of capturing from video.

---

## Technical Implementation Questions

### Q5: How do I embed a Whatnot stream URL in the application?

**Answer:** Whatnot streams are typically hosted on their platform with URLs like `https://www.whatnot.com/live/{stream_id}`. Attempt to embed using an iframe:

```tsx
<iframe
  src={whatnotStreamUrl}
  className="w-full aspect-video"
  allow="autoplay; fullscreen"
  allowFullScreen
/>
```

**If iframe embedding is blocked by Whatnot's Content Security Policy:**
- Provide instructions for users to open the stream in a separate browser window
- Use OBS or a screen capture tool to create a virtual camera feed
- Capture frames from the virtual camera using the existing camera integration code

**Alternative:** Use the Screen Capture API to allow users to select the Whatnot browser tab:

```typescript
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: { mediaSource: 'browser' }
});
```

---

### Q6: How do I capture a frame from the embedded video?

**Answer:** Use the HTML5 Canvas API to screenshot the current video frame:

```typescript
const captureFrame = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // Convert to base64 JPEG (reduce size)
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
};
```

**Optimization:** Resize the image to 800x600 pixels before sending to GPT-4 Vision to reduce API latency:

```typescript
const resizeImage = (base64: string, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
};
```

---

### Q7: How do I calculate the deal indicator (good deal, fair, overpriced)?

**Answer:** Compare the current bid price to the lowest Amazon price using percentage thresholds:

```typescript
const calculateDealIndicator = (bidPrice: number, lowestAmazonPrice: number) => {
  const percentage = (bidPrice / lowestAmazonPrice) * 100;
  
  if (percentage < 70) {
    return { color: 'green', text: 'GOOD DEAL', emoji: '🟢' };
  } else if (percentage < 90) {
    return { color: 'yellow', text: 'FAIR', emoji: '🟡' };
  } else {
    return { color: 'red', text: 'OVERPRICED', emoji: '🔴' };
  }
};
```

**Usage:**
```tsx
const indicator = calculateDealIndicator(currentBid, products[0].price);
<Badge className={`bg-${indicator.color}-500`}>
  {indicator.emoji} {indicator.text}
</Badge>
```

---

### Q8: How do I calculate resale profit with fees?

**Answer:** Use a simplified fee structure for the initial version:

```typescript
const calculateProfit = (bidPrice: number, amazonPrice: number, platform: 'amazon' | 'ebay') => {
  let fees = 0;
  
  if (platform === 'amazon') {
    fees = amazonPrice * 0.15 + 3; // 15% FBA fee + $3 shipping
  } else if (platform === 'ebay') {
    fees = amazonPrice * 0.13 + 2; // 13% eBay fee + $2 shipping
  }
  
  const whatnotBuyerFee = bidPrice * 0.08; // 8% Whatnot buyer fee
  const totalCost = bidPrice + whatnotBuyerFee;
  const netProfit = amazonPrice - totalCost - fees;
  const profitMargin = (netProfit / amazonPrice) * 100;
  
  return {
    grossProfit: amazonPrice - totalCost,
    netProfit,
    profitMargin,
    totalCost,
    fees,
  };
};
```

**Display:**
```tsx
const profit = calculateProfit(currentBid, products[0].price, 'amazon');
<div>
  <p>Potential Profit: ${profit.netProfit.toFixed(2)}</p>
  <p className="text-sm text-gray-400">
    ({profit.profitMargin.toFixed(1)}% margin)
  </p>
  <p className="text-xs text-gray-500">
    After fees: ${profit.fees.toFixed(2)}
  </p>
</div>
```

---

### Q9: Should I add audio capture in the initial version?

**Answer:** Audio capture is optional and can be skipped in the initial version to simplify development. Image analysis alone is sufficient for most use cases, as product branding is usually visible on packaging. If you decide to implement audio capture, use the Web Audio API to capture system audio:

```typescript
const captureAudio = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const transcript = await transcribeAudio(audioBlob);
    // Combine with vision analysis
  };
  
  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 5000); // Record 5 seconds
};
```

**Note:** Capturing system audio (the stream's audio) requires additional setup (virtual audio cables) or browser extensions. For simplicity, capture microphone audio if the user plays the stream through speakers.

---

### Q10: How do I handle cases where GPT-4 Vision cannot identify the product?

**Answer:** Detect uncertain responses by checking for specific phrases:

```typescript
const analyzeProductImage = async (imageBase64: string): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Extract the exact product name, brand, and model number. Return ONLY the clean product name. If you cannot identify the product, return "UNKNOWN".'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What product is this?' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }
    ]
  });
  
  const productName = response.choices[0].message.content.trim();
  
  // Detect failure keywords
  const failureKeywords = ['unknown', 'cannot', 'unclear', 'not visible', 'unable to'];
  if (failureKeywords.some(keyword => productName.toLowerCase().includes(keyword))) {
    return ''; // Return empty string to indicate failure
  }
  
  return productName;
};
```

**UI Handling:**
```tsx
if (!productName) {
  alert('❌ Could not identify product. Please recapture with clearer branding visible.');
  return;
}
```

---

## API and Rate Limiting Questions

### Q11: What are the API rate limits for OpenAI and ScrapingBee?

**Answer:**

**OpenAI GPT-4 Vision:**
- Free tier: Not available (requires paid account)
- Tier 1: 500 requests per day
- Tier 2: 5,000 requests per day
- Cost: ~$0.01 per image analysis

**ScrapingBee:**
- Free tier: 1,000 API credits (100 requests per month)
- Starter plan: $49/month for 150,000 credits
- Cost: ~$0.005 per Amazon search request

**Recommendation:** Start with paid OpenAI account (Tier 1) and ScrapingBee Starter plan. Monitor usage and upgrade as needed.

---

### Q12: How do I handle API rate limit errors?

**Answer:** Implement exponential backoff and user-friendly error messages:

```typescript
const searchWithRetry = async (query: string, retries = 3): Promise<Product[]> => {
  try {
    return await searchAmazonProducts(query);
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      // Rate limit exceeded, wait and retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries)));
      return searchWithRetry(query, retries - 1);
    }
    throw error;
  }
};
```

**UI Error Handling:**
```tsx
try {
  const products = await searchWithRetry(productName);
} catch (error) {
  if (error.status === 429) {
    alert('⚠️ API rate limit exceeded. Please wait a moment and try again.');
  } else {
    alert('❌ Search failed. Please check your internet connection.');
  }
}
```

---

### Q13: Can I cache Amazon search results to reduce API calls?

**Answer:** Yes. Implement a simple in-memory cache with a TTL (time-to-live):

```typescript
const cache = new Map<string, { data: Product[], timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

const searchAmazonProductsCached = async (query: string): Promise<Product[]> => {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const products = await searchAmazonProducts(query);
  cache.set(query, { data: products, timestamp: Date.now() });
  return products;
};
```

**Note:** Cache should be cleared when the application restarts. For persistent caching, use a database (PostgreSQL) or Redis.

---

## UI/UX Questions

### Q14: Should I add keyboard shortcuts for the CAPTURE button?

**Answer:** Yes. Add a keyboard shortcut (Spacebar or C key) to trigger the capture action:

```typescript
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'KeyC') {
      event.preventDefault();
      handleCapture();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**User Feedback:** Display a toast notification when the shortcut is used:
```tsx
toast.success('📸 Image captured!');
```

---

### Q15: How do I display the deal indicator prominently?

**Answer:** Use a large, colored badge with animation:

```tsx
<Badge
  className={cn(
    'text-2xl font-bold px-6 py-3 animate-pulse',
    indicator.color === 'green' && 'bg-green-500',
    indicator.color === 'yellow' && 'bg-yellow-500',
    indicator.color === 'red' && 'bg-red-500'
  )}
>
  {indicator.emoji} {indicator.text}
</Badge>
```

**Positioning:** Place the deal indicator at the top of the "Deal Calculator" section, directly above the bid tracker input field, so it's immediately visible after entering a bid price.

---

### Q16: Should I show all three Amazon listings or just the lowest price?

**Answer:** Show all three listings to give users context and alternatives. Highlight the lowest-priced option with a green border:

```tsx
<div className="grid grid-cols-3 gap-4">
  {products.map((product, index) => (
    <ProductCard
      key={index}
      {...product}
      className={index === 0 ? 'border-2 border-green-500' : ''}
    />
  ))}
</div>
```

**Label:** Add a "LOWEST PRICE" badge to the first product card:
```tsx
{index === 0 && <Badge className="bg-green-500">LOWEST PRICE</Badge>}
```

---

## Deployment and Testing Questions

### Q17: How do I deploy Whatnot Spy to Vercel?

**Answer:** Follow these steps:

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/FAMEparty/whatnot-spy.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import the `whatnot-spy` repository
   - Configure build settings:
     - Framework: Vite
     - Build Command: `pnpm build`
     - Output Directory: `client/dist`

3. **Set environment variables in Vercel dashboard:**
   - `OPENAI_API_KEY`
   - `SCRAPINGBEE_API_KEY`
   - `NODE_ENV=production`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy the application
   - Access the live URL: `https://whatnot-spy.vercel.app`

---

### Q18: How do I test the application locally before deploying?

**Answer:** Run the development server:

```bash
cd whatnot-spy
pnpm install
pnpm dev
```

**Access the application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3000/api/trpc`

**Test with sample data:**
- Use static product images to test vision analysis
- Mock API responses to avoid consuming API credits during development

---

### Q19: Should I add analytics to track usage?

**Answer:** Yes, but keep it simple for the initial version. Use Vercel Analytics (free) to track page views and performance:

```tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourAppContent />
      <Analytics />
    </>
  );
}
```

**Future Enhancement:** Add custom event tracking for key actions (captures, searches, deal indicators) using Vercel Analytics or Google Analytics.

---

## Troubleshooting Common Issues

### Issue 1: Iframe embedding is blocked by Whatnot

**Symptom:** The embedded video player shows a blank screen or "This content cannot be embedded" message.

**Solution:**
- Check Whatnot's Content Security Policy (CSP) headers
- If embedding is blocked, provide instructions for users to:
  1. Open the Whatnot stream in a separate browser window
  2. Use OBS or a screen capture tool to create a virtual camera feed
  3. Capture frames from the virtual camera using the existing camera integration

**Alternative:** Use the Screen Capture API to allow users to select the Whatnot browser tab:
```typescript
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
```

---

### Issue 2: GPT-4 Vision returns incorrect product names

**Symptom:** The AI identifies the wrong product or returns generic descriptions like "sneakers" instead of "Nike Air Max 270."

**Solution:**
- Improve the system prompt to emphasize brand names and model numbers:
  ```
  "Focus on visible branding, logos, and model numbers. Return the exact product name as it would appear on Amazon."
  ```
- Increase image resolution before sending to GPT-4 Vision (use 1024x1024 instead of 800x600)
- Add a confidence check: if the response is too generic (< 3 words), prompt the user to recapture

---

### Issue 3: ScrapingBee returns no results

**Symptom:** The Amazon search returns an empty array or "No products found" error.

**Solution:**
- Verify the product name is clean and specific (e.g., "Nike Air Max 270" not "sneakers")
- Check if the product exists on Amazon by manually searching
- Add fallback logic: if no results, try a simplified search query (remove model numbers, keep only brand + category)
- Display a helpful error message: "No Amazon listings found. Try recapturing with a different angle."

---

### Issue 4: Deal indicator shows incorrect colors

**Symptom:** The deal indicator shows "GOOD DEAL" (green) when the bid is actually higher than the Amazon price.

**Solution:**
- Verify the price parsing logic removes currency symbols and converts to numbers:
  ```typescript
  const parsePrice = (priceString: string): number => {
    return parseFloat(priceString.replace(/[^0-9.]/g, ''));
  };
  ```
- Double-check the comparison logic in `calculateDealIndicator`:
  ```typescript
  const percentage = (bidPrice / lowestAmazonPrice) * 100;
  ```

---

### Issue 5: Profit calculator shows negative profit

**Symptom:** The profit calculator displays negative values even when the bid is lower than the Amazon price.

**Solution:**
- Review the fee calculation logic to ensure fees are not double-counted
- Verify the Whatnot buyer fee (8%) is applied to the bid price, not the Amazon price
- Add a warning message when profit is negative: "⚠️ This bid will result in a loss if resold at the lowest Amazon price."

---

## Best Practices

### Performance Optimization

1. **Resize images before sending to GPT-4 Vision** to reduce API latency (800x600 pixels is sufficient)
2. **Cache Amazon search results** for 1 hour to reduce API calls for repeat searches
3. **Debounce bid tracker input** to avoid recalculating the deal indicator on every keystroke
4. **Use lazy loading** for product images to improve initial page load time

### Security

1. **Never expose API keys in the frontend** - all API calls should go through the backend
2. **Validate user input** to prevent injection attacks (e.g., sanitize Whatnot stream URLs)
3. **Use HTTPS** for all API requests and deployments
4. **Implement rate limiting** on the backend to prevent abuse

### User Experience

1. **Show loading indicators** during API calls (image analysis, Amazon search)
2. **Provide clear error messages** when something goes wrong (e.g., "Could not identify product")
3. **Add keyboard shortcuts** for common actions (Spacebar to capture, Enter to update bid)
4. **Use toast notifications** for non-blocking feedback (e.g., "Image captured!")

---

## Next Steps After Initial Version

Once the initial version is complete and deployed, consider these enhancements:

1. **User accounts and saved searches** - Allow users to track products and revisit them later
2. **Automated price alerts** - Notify users when a product drops below a certain price on Amazon
3. **Multi-platform support** - Extend to eBay Live, Facebook Marketplace Live, etc.
4. **Mobile app** - Build a React Native version for on-the-go price checking
5. **Chrome extension** - Overlay price analysis directly on the Whatnot website
6. **Bulk analysis** - Capture and analyze multiple products in a single auction
7. **Historical price tracking** - Show Amazon price trends over time
8. **Competitor analysis** - Compare prices across multiple resale platforms (eBay, Mercari, Poshmark)

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Author:** Manus AI  
**Contact:** Use this FAQ to troubleshoot issues during Whatnot Spy development.
