# Reusable Code Guide for Whatnot Spy

This document maps the existing code from "Live Product Search" that can be directly reused or adapted for the "Whatnot Spy" application.

---

## Backend Services

### 1. Vision Analyzer (`server/services/visionAnalyzer.ts`)

**Purpose:** Analyzes product images using GPT-4 Vision API to extract product names, brands, and model numbers.

**Reusability:** 95% - Can be used almost as-is with minor prompt modifications.

**Required Changes:**
- Modify the system prompt to emphasize speed: "Be fast and concise. Return ONLY the product name suitable for Amazon search."
- Reduce `max_tokens` from 150 to 100 to speed up responses
- Add confidence scoring: if the response contains uncertain language ("might be", "possibly"), return empty string

**Current Code Location:** `/home/ubuntu/whatnot-product-display/server/services/visionAnalyzer.ts`

**Key Function:**
```typescript
export async function analyzeProductImage(imageBase64: string): Promise<string>
```

**Usage in Whatnot Spy:**
```typescript
const productName = await analyzeProductImage(capturedImageBase64);
if (!productName) {
  return { error: "Could not identify product. Please recapture." };
}
```

---

### 2. Amazon Scraper (`server/services/amazonScraper.ts`)

**Purpose:** Queries ScrapingBee Amazon Search API and parses product listings.

**Reusability:** 100% - Can be used without any modifications.

**Current Code Location:** `/home/ubuntu/whatnot-product-display/server/services/amazonScraper.ts`

**Key Function:**
```typescript
export async function searchAmazonProducts(query: string): Promise<Product[]>
```

**Returns:**
```typescript
interface Product {
  title: string;
  price: string;
  image: string;
  url: string;
  asin: string;
}
```

**Features Already Implemented:**
- Filters out sponsored listings
- Extracts `url_image` field correctly
- Returns top 3 organic results
- Handles API errors gracefully

**Usage in Whatnot Spy:**
```typescript
const products = await searchAmazonProducts(productName);
// products array is ready to display in UI
```

---

### 3. Product Extractor (`server/services/productExtractor.ts`)

**Purpose:** Uses GPT-4 to clean and normalize product names from voice transcripts.

**Reusability:** 80% - Useful if audio capture is implemented.

**Required Changes:**
- Simplify the prompt to focus on extracting product names from auction seller speech
- Add context: "This is from a live auction. The seller may use casual language or abbreviations."

**Current Code Location:** `/home/ubuntu/whatnot-product-display/server/services/productExtractor.ts`

**Key Function:**
```typescript
export async function extractProductName(transcript: string): Promise<string>
```

**Usage in Whatnot Spy (if audio capture is enabled):**
```typescript
const audioTranscript = await transcribeAudio(audioBlob);
const productNameFromAudio = await extractProductName(audioTranscript);
// Combine with vision analysis for improved accuracy
```

---

## tRPC API Endpoints

### Current Router Structure (`server/routers.ts`)

**Reusable Pattern:**
```typescript
export const appRouter = router({
  amazon: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        capturedImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Vision analysis
        // Amazon search
        // Return results
      }),
  }),
});
```

**For Whatnot Spy, create:**
```typescript
export const appRouter = router({
  spy: router({
    analyzeProduct: publicProcedure
      .input(z.object({
        imageBase64: z.string(),
        audioTranscript: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // 1. Analyze image with GPT-4 Vision
        const productName = await analyzeProductImage(input.imageBase64);
        
        // 2. If audio provided, combine with vision
        if (input.audioTranscript) {
          const audioProduct = await extractProductName(input.audioTranscript);
          // Merge results
        }
        
        // 3. Search Amazon
        const products = await searchAmazonProducts(productName);
        
        // 4. Return results
        return {
          productName,
          products,
          capturedImage: input.imageBase64,
        };
      }),
  }),
});
```

---

## Frontend Components

### 1. ProductCard (`client/src/components/ProductCard.tsx`)

**Purpose:** Displays a single product with image, title, price, and link.

**Reusability:** 90% - Needs minor styling adjustments for horizontal layout.

**Current Props:**
```typescript
interface ProductCardProps {
  title: string;
  price: string;
  image: string;
  url: string;
  status?: 'idle' | 'ready';
}
```

**Required Changes for Whatnot Spy:**
- Remove OBS-specific features (READY indicator, price history chart)
- Simplify to show only: image, title, price, "View on Amazon" link
- Add "lowest price" highlight (green border) for the cheapest option

**Usage in Whatnot Spy:**
```tsx
<div className="grid grid-cols-3 gap-4">
  {products.map((product, index) => (
    <ProductCard
      key={index}
      {...product}
      isLowestPrice={index === 0} // Highlight first (cheapest) product
    />
  ))}
</div>
```

---

### 2. shadcn/ui Components

**Reusable Components:**
- `Button` - For CAPTURE, RECAPTURE, etc.
- `Input` - For bid tracker input field
- `Badge` - For deal indicator (GOOD DEAL, FAIR, OVERPRICED)
- `Card` - For product listings
- `Dialog` - For error messages or help modals

**All components are already configured with the dark cyberpunk theme and can be imported directly:**

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
```

---

### 3. useVoiceRecognition Hook (`client/src/hooks/useVoiceRecognition.ts`)

**Purpose:** Handles Web Speech API for voice transcription.

**Reusability:** 50% - Needs modification for audio capture from stream instead of microphone.

**For Whatnot Spy:**
- Replace Web Speech API with Web Audio API + Whisper API
- Capture system audio (stream audio) instead of microphone input
- This is more complex and may require browser extensions or virtual audio cables

**Alternative Approach:**
Skip real-time audio capture in the initial version. Focus on image analysis only, and add audio as an optional enhancement later.

---

## Styling and Theme

### Global Styles (`client/src/index.css`)

**Reusability:** 100% - Copy the entire file to maintain consistent branding.

**Key Theme Variables:**
```css
:root {
  --background: 222.2 84% 4.9%; /* Dark slate */
  --foreground: 210 40% 98%; /* Light gray text */
  --primary: 24.6 95% 53.1%; /* Orange accent */
  --border: 217.2 32.6% 17.5%; /* Subtle gray borders */
}
```

**Typography:**
- Headings: `font-family: 'Chakra Petch', sans-serif;`
- Body: `font-family: 'Inter', sans-serif;`

**Custom Classes:**
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

---

## Environment Configuration

### Required Environment Variables

**Backend (.env):**
```
OPENAI_API_KEY=sk-...
SCRAPINGBEE_API_KEY=...
NODE_ENV=development
PORT=3000
```

**Frontend (Vite):**
```
VITE_APP_TITLE=Whatnot Spy
VITE_APP_LOGO=/logo.png
```

### API Key Management

**Security Best Practice:**
All API keys should be stored on the backend and never exposed to the frontend. The tRPC endpoints handle API calls server-side, keeping keys secure.

```typescript
// ❌ BAD: Exposing API key in frontend
const response = await fetch('https://api.openai.com/...', {
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
});

// ✅ GOOD: API call handled by backend
const result = await trpc.spy.analyzeProduct.mutate({ imageBase64 });
```

---

## Deployment Configuration

### Vercel Deployment (Recommended)

**File: `vercel.json`**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/index.ts"
    }
  ]
}
```

**Environment Variables (Vercel Dashboard):**
- `OPENAI_API_KEY`
- `SCRAPINGBEE_API_KEY`
- `NODE_ENV=production`

---

## Testing Utilities

### Image Capture Testing

**Test with Static Images:**
```typescript
// Create a test image from a URL
const testImageUrl = 'https://example.com/product.jpg';
const response = await fetch(testImageUrl);
const blob = await response.blob();
const reader = new FileReader();
reader.readAsDataURL(blob);
reader.onloadend = () => {
  const base64Image = reader.result.split(',')[1];
  // Test vision analysis with this image
};
```

### Mock API Responses

**For development without consuming API credits:**
```typescript
// Mock GPT-4 Vision response
const mockVisionResponse = "Nike Air Max 270 Black White";

// Mock ScrapingBee response
const mockAmazonProducts = [
  { title: "Nike Air Max 270", price: "$89.99", image: "...", url: "...", asin: "..." },
  { title: "Nike Air Max 270 White", price: "$95.00", image: "...", url: "...", asin: "..." },
  { title: "Nike Air Max 270 Black", price: "$110.00", image: "...", url: "...", asin: "..." },
];
```

---

## Code Migration Checklist

When starting the Whatnot Spy project, copy these files directly:

**Backend:**
- [ ] `server/services/visionAnalyzer.ts` (modify prompt)
- [ ] `server/services/amazonScraper.ts` (use as-is)
- [ ] `server/services/productExtractor.ts` (optional, for audio)
- [ ] `server/routers.ts` (adapt structure)

**Frontend:**
- [ ] `client/src/components/ProductCard.tsx` (simplify)
- [ ] `client/src/components/ui/*` (all shadcn components)
- [ ] `client/src/index.css` (entire file)
- [ ] `client/src/lib/utils.ts` (utility functions)

**Configuration:**
- [ ] `package.json` (same dependencies)
- [ ] `tsconfig.json` (TypeScript config)
- [ ] `tailwind.config.js` (Tailwind theme)
- [ ] `vite.config.ts` (Vite build config)

**Documentation:**
- [ ] `STREAMDECK.md` (not needed for Whatnot Spy)
- [ ] `README.md` (create new, specific to Whatnot Spy)

---

## Summary

Approximately **70% of the codebase** from "Live Product Search" can be directly reused or easily adapted for "Whatnot Spy." The core AI and API integration logic is identical, and the UI components share the same design system. The main new development work involves:

1. **Stream integration** - Embedding Whatnot video player
2. **Image capture from video** - Using Canvas API to screenshot frames
3. **Deal calculator** - Comparing bid prices to Amazon prices
4. **Profit estimator** - Calculating resale margins

By leveraging the existing codebase, the Whatnot Spy project can be completed significantly faster than building from scratch, while maintaining consistency with the "Live Product Search" brand and user experience.

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Author:** Manus AI
