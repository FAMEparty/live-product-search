# Whatnot Spy - Complete Specification Document

**Project Name:** Whatnot Spy  
**Repository Name:** `whatnot-spy`  
**Purpose:** Real-time product price analysis tool for Whatnot live auction buyers  
**Author:** Manus AI  
**Date:** December 3, 2025  

---

## Executive Summary

Whatnot Spy is a specialized web application designed to help buyers make informed bidding decisions during live Whatnot auctions. The application allows users to paste a Whatnot stream URL, capture product images from the live video, and instantly receive AI-powered product identification with Amazon price comparisons. The system calculates potential profit margins and provides real-time deal indicators as bid prices increase, enabling users to identify underpriced items and avoid overpaying.

---

## Core Objectives

The primary goal of Whatnot Spy is to provide buyers with a competitive advantage during live auctions by delivering fast, accurate product pricing intelligence. The application must process product images within seconds, present clear price comparisons, and calculate resale profitability to help users make split-second bidding decisions. Unlike the companion "Live Product Search" application (designed for sellers), Whatnot Spy focuses exclusively on the buyer's perspective, eliminating unnecessary features like OBS integration and Stream Deck controls in favor of a streamlined, fast-response interface.

---

## Target Users

The application serves three primary user segments. **Resellers** use the tool to identify profitable arbitrage opportunities by comparing auction prices against Amazon retail prices. **Collectors** leverage the system to verify they are paying fair market value for items they intend to keep. **Casual buyers** benefit from quick price checks to avoid impulse purchases at inflated prices. All users share a common need for speed and accuracy, as live auctions move quickly and bidding windows are often measured in seconds.

---

## Key Features

### 1. Stream Integration

Users paste a Whatnot live stream URL directly into the application. The system embeds the video player within the interface, allowing users to watch the auction while simultaneously accessing price analysis tools. The embedded player should support standard video controls (play, pause, volume) and maintain synchronization with the live broadcast. If Whatnot uses iframe embedding restrictions, the application should provide clear instructions for users to open the stream in a separate window and use screen capture methods as a fallback.

### 2. Manual Image Capture

A prominent "CAPTURE" button allows users to screenshot the current video frame when the seller displays a product. This manual approach conserves computational resources and gives users control over when to analyze products. The captured image is immediately processed through GPT-4 Vision for product identification, with the original frame stored temporarily for reference. Users should see visual feedback (flash effect or border highlight) confirming the capture was successful.

### 3. AI Product Identification

The captured image is analyzed using GPT-4 Vision (model: `gpt-4o`) to extract the product name, brand, and model number. The AI prompt should instruct the model to focus on visible packaging, labels, and product markings, prioritizing brand names and model numbers that can be used for precise Amazon searches. The system should handle partial visibility, multiple products in frame, and low-quality video streams by returning the most confident identification or prompting the user to recapture if confidence is low.

### 4. Amazon Price Comparison

Once a product is identified, the system queries the ScrapingBee Amazon Search API to retrieve three product listings with prices. The results are filtered to show only organic (non-sponsored) listings and sorted by price (lowest to highest). Each listing displays the product title, price, thumbnail image, and a direct link to the Amazon product page. The interface should clearly highlight the **lowest price** as the primary benchmark for deal evaluation.

### 5. Deal Indicator System

The application calculates whether the current auction bid represents a good deal by comparing it against the lowest Amazon price. The deal indicator uses a color-coded system:

| Indicator | Color | Condition | Meaning |
|-----------|-------|-----------|---------|
| 🟢 GOOD DEAL | Green | Bid < 70% of lowest Amazon price | Strong profit potential |
| 🟡 FAIR | Yellow | Bid between 70-90% of lowest Amazon price | Moderate profit potential |
| 🔴 OVERPRICED | Red | Bid > 90% of lowest Amazon price | Minimal or negative profit |

The indicator updates automatically as the user inputs new bid amounts, providing real-time feedback during the auction.

### 6. Resale Profit Calculator

The profit calculator estimates potential earnings if the user wins the auction and resells the product on Amazon or other platforms. The calculation follows this formula:

```
Potential Profit = Lowest Amazon Price - Current Bid - Estimated Fees
```

Estimated fees include:
- **Amazon FBA fees:** 15% of sale price (average across categories)
- **Shipping to Amazon:** $3 (flat estimate)
- **Whatnot buyer fee:** 8% of winning bid

The calculator displays both the **gross profit** (before fees) and **net profit** (after fees), along with the **profit margin percentage**. Users can toggle between "Amazon FBA" and "eBay" fee structures to see different resale scenarios.

### 7. Bid Tracker

A simple input field allows users to enter the current bid price as it increases during the auction. The system immediately recalculates the deal indicator and profit estimate each time the bid amount changes. The interface should support rapid updates (users may need to update the bid multiple times per minute) and provide keyboard shortcuts (e.g., press Enter to update) for speed.

### 8. Audio Capture (Optional)

An optional toggle enables audio capture from the stream, allowing the AI to extract product names mentioned verbally by the seller. This feature uses the Web Audio API to capture system audio or microphone input (if the user plays the stream through speakers). The captured audio is transcribed using Whisper API and combined with vision analysis for improved identification accuracy. However, audio capture is secondary to image analysis, as many sellers do not verbally mention brand names or model numbers.

---

## Technical Architecture

### Frontend Stack

The application uses **React 19** with **TypeScript** for type safety and modern component patterns. **Vite** serves as the build tool for fast development and optimized production builds. The UI framework is **Tailwind CSS 4** with **shadcn/ui** components for consistent design. **Wouter** handles client-side routing (if multiple views are needed in the future). The same dark cyberpunk aesthetic from the "Live Product Search" application should be maintained for brand consistency.

### Backend Stack

The backend runs on **Node.js 22** with **Express** and **tRPC** for type-safe API communication. The server handles API key management for OpenAI and ScrapingBee, preventing exposure of sensitive credentials in the frontend. **Drizzle ORM** with **PostgreSQL** can be added later if user accounts and saved searches are implemented, but the initial version should remain stateless to minimize complexity.

### Key APIs and Services

The application integrates three external services:

**OpenAI GPT-4 Vision API** (`gpt-4o` model) analyzes captured images to identify products. The API request includes a system prompt instructing the model to extract brand names, product names, and model numbers suitable for Amazon searches. The response is parsed to extract the product name, with fallback logic to handle cases where the AI cannot confidently identify the product.

**ScrapingBee Amazon Search API** retrieves product listings from Amazon without requiring direct web scraping. The API accepts a search query (the product name extracted by GPT-4 Vision) and returns structured JSON with product titles, prices, images, and URLs. The application filters out sponsored listings and limits results to three items for simplicity.

**Whisper API** (optional) transcribes audio from the stream if the user enables audio capture. The transcription is combined with vision analysis to improve product identification accuracy, particularly when the product packaging is partially obscured or the seller mentions specific model numbers verbally.

### Reusable Code from "Live Product Search"

Several modules from the existing "Live Product Search" application can be directly reused or adapted:

**Vision Analyzer** (`server/services/visionAnalyzer.ts`) contains the GPT-4 Vision integration for product image analysis. The prompt should be slightly modified to emphasize speed over detail, as Whatnot Spy users need results in seconds.

**Amazon Scraper** (`server/services/amazonScraper.ts`) handles ScrapingBee API calls and parses product data. The existing logic for filtering sponsored listings and extracting image URLs can be used without modification.

**Product Extractor** (`server/services/productExtractor.ts`) uses GPT-4 to clean and normalize product names from voice transcripts. This module is useful if audio capture is enabled.

**tRPC Router** (`server/routers.ts`) defines the API endpoints for product search. A new `spy.search` endpoint should be created that accepts an image and optional audio transcript, returning product data and Amazon prices.

**UI Components** such as `ProductCard`, `Button`, and `Input` from the shadcn/ui library can be reused for consistent styling.

---

## User Interface Design

### Layout Structure

The interface is divided into three main sections arranged vertically:

**Stream Viewer** (top section) displays the embedded Whatnot video player with a "CAPTURE" button overlaid in the bottom-right corner. The button should be large, highly visible, and use a bright accent color (e.g., orange) to stand out against the video. A small "Audio Capture" toggle switch appears in the top-right corner of the video player.

**Product Analysis** (middle section) shows the captured product image thumbnail, AI-identified product name, and the three Amazon price options in a horizontal card layout. Each Amazon listing displays the product image, title (truncated to two lines), price in large bold text, and a "View on Amazon" link. The lowest-priced option is highlighted with a green border.

**Deal Calculator** (bottom section) contains the bid tracker input field, deal indicator badge, and profit calculator results. The deal indicator is prominently displayed as a large colored badge (green, yellow, or red) with the text "GOOD DEAL," "FAIR," or "OVERPRICED." Below the indicator, the profit calculator shows "Potential Profit: $XX (XX% margin)" with a breakdown of fees when the user hovers over the value.

### Color Scheme and Typography

The application uses the same dark cyberpunk theme as "Live Product Search" to maintain brand consistency:

- **Background:** Dark slate (`#0f172a`)
- **Primary accent:** Orange (`#fb923c`)
- **Text:** Light gray (`#e2e8f0`)
- **Borders:** Subtle gray (`#334155`)
- **Success (good deal):** Green (`#10b981`)
- **Warning (fair):** Yellow (`#fbbf24`)
- **Danger (overpriced):** Red (`#ef4444`)

Typography uses **Chakra Petch** for headings and buttons (bold, uppercase) and **Inter** for body text. All text should be highly legible against the dark background, with sufficient contrast ratios for accessibility.

### Responsive Design

The application should be optimized for desktop use (1920x1080 or larger), as users typically watch Whatnot streams on laptops or external monitors. Mobile support is not a priority for the initial version, but the layout should gracefully degrade to tablet sizes (768px width) if needed. The video player should maintain a 16:9 aspect ratio and scale proportionally.

---

## Implementation Plan

### Phase 1: Project Setup and Stream Integration

Create a new GitHub repository named `whatnot-spy` and initialize the project using the same template as "Live Product Search" (React 19 + Vite + Tailwind 4 + tRPC). Set up environment variables for OpenAI and ScrapingBee API keys. Implement the stream viewer interface with an input field for pasting Whatnot URLs and an embedded iframe or video element. Test embedding with sample Whatnot stream URLs to verify compatibility.

### Phase 2: Image Capture and Vision Analysis

Add a "CAPTURE" button that screenshots the current video frame using the HTML5 Canvas API. Convert the captured frame to a base64-encoded JPEG image and send it to the backend via a tRPC mutation. Implement the vision analyzer endpoint that calls GPT-4 Vision with the captured image and returns the identified product name. Display the product name and captured image thumbnail in the UI.

### Phase 3: Amazon Price Comparison

Integrate the ScrapingBee Amazon Search API to retrieve product listings based on the identified product name. Parse the API response to extract the top three organic listings with prices, images, and URLs. Display the listings in a horizontal card layout with the lowest price highlighted. Add error handling for cases where no products are found or the API rate limit is exceeded.

### Phase 4: Deal Indicator and Profit Calculator

Implement the bid tracker input field that accepts the current auction bid price. Calculate the deal indicator (good deal, fair, overpriced) based on the comparison between the bid and the lowest Amazon price. Display the indicator as a colored badge with dynamic updates as the bid changes. Add the profit calculator that estimates net profit after fees, with a toggle to switch between Amazon FBA and eBay fee structures.

### Phase 5: Audio Capture (Optional)

Add an optional audio capture toggle that uses the Web Audio API to record audio from the stream. Implement the Whisper API integration to transcribe the audio and extract product names mentioned verbally. Combine the audio transcript with vision analysis to improve identification accuracy. Test with sample Whatnot streams to verify audio quality and transcription accuracy.

### Phase 6: Testing and Optimization

Conduct end-to-end testing with real Whatnot streams to verify the entire workflow (paste URL → capture image → identify product → show prices → calculate profit). Optimize image processing speed by reducing image resolution before sending to GPT-4 Vision (e.g., resize to 800x600 pixels). Add loading indicators and error messages to improve user experience during API calls. Test edge cases such as multiple products in frame, low-quality video, and products without visible branding.

### Phase 7: Deployment and Documentation

Deploy the application to Vercel or a similar hosting platform with environment variables configured for API keys. Create a user guide (README.md) with screenshots explaining how to use the application. Document known limitations (e.g., Whatnot iframe embedding restrictions, API rate limits) and provide troubleshooting tips. Set up GitHub Actions for automated testing and deployment on push to the main branch.

---

## API Integration Details

### OpenAI GPT-4 Vision API

**Endpoint:** `https://api.openai.com/v1/chat/completions`  
**Model:** `gpt-4o`  
**Request Format:**

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a product identification expert. Analyze images from live auction streams and extract the exact product name, brand, and model number. Focus on visible packaging, labels, and product markings. Return ONLY the clean product name suitable for Amazon search. Be fast and concise."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What product is this? Extract the brand, name, and model number."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,{base64_image}",
            "detail": "high"
          }
        }
      ]
    }
  ],
  "max_tokens": 100,
  "temperature": 0.2
}
```

**Response Parsing:**

Extract the product name from `response.choices[0].message.content`. If the response contains phrases like "I can't determine" or "unclear," return an empty string and prompt the user to recapture the image.

### ScrapingBee Amazon Search API

**Endpoint:** `https://app.scrapingbee.com/api/v1/amazon`  
**Parameters:**

```
api_key: {SCRAPINGBEE_API_KEY}
search: {product_name}
country_code: us
```

**Response Format:**

```json
{
  "organic_results": [
    {
      "title": "Product Title",
      "price": "$XX.XX",
      "url_image": "https://m.media-amazon.com/images/...",
      "url": "https://www.amazon.com/dp/{ASIN}",
      "is_sponsored": false
    }
  ]
}
```

**Filtering Logic:**

Filter out all listings where `is_sponsored: true`. Sort remaining listings by price (lowest first). Return the top three listings.

### Whisper API (Optional)

**Endpoint:** `https://api.openai.com/v1/audio/transcriptions`  
**Model:** `whisper-1`  
**Request Format:**

```
POST https://api.openai.com/v1/audio/transcriptions
Content-Type: multipart/form-data

file: {audio_file.mp3}
model: whisper-1
language: en
```

**Response Parsing:**

Extract the transcript from `response.text`. Combine with the product name from vision analysis to improve search accuracy.

---

## Environment Variables

The following environment variables must be configured in the `.env` file:

```
OPENAI_API_KEY=sk-...
SCRAPINGBEE_API_KEY=...
VITE_APP_TITLE=Whatnot Spy
VITE_APP_LOGO=/logo.png
```

For production deployment, these variables should be set in the hosting platform's environment configuration (e.g., Vercel Environment Variables).

---

## Testing Checklist

Before deploying the application, verify the following test cases:

- [ ] Paste a valid Whatnot stream URL and verify the video player loads correctly
- [ ] Click "CAPTURE" and verify the image is captured and displayed as a thumbnail
- [ ] Verify GPT-4 Vision correctly identifies a product with visible branding (e.g., Nike shoe box)
- [ ] Verify Amazon search returns three relevant product listings with prices
- [ ] Enter a bid price and verify the deal indicator updates correctly (green, yellow, or red)
- [ ] Verify the profit calculator shows accurate net profit after fees
- [ ] Test with a product that has no visible branding and verify the error message appears
- [ ] Test with a low-quality video stream and verify image capture still works
- [ ] Enable audio capture and verify the transcript is combined with vision analysis
- [ ] Test the application on a 1920x1080 desktop display and verify layout is correct
- [ ] Verify all API keys are stored securely on the backend (not exposed in frontend)
- [ ] Test API rate limit handling (e.g., ScrapingBee returns 429 error)

---

## Known Limitations and Future Enhancements

### Current Limitations

**Whatnot iframe embedding** may be restricted by the platform's Content Security Policy. If embedding fails, users must open the stream in a separate window and use screen capture methods (e.g., OBS virtual camera) as a workaround.

**API rate limits** for ScrapingBee (100 requests per month on free tier) may be exceeded quickly during heavy use. Consider upgrading to a paid plan or implementing request caching to reduce API calls.

**Audio capture quality** depends on the user's system audio configuration. If the stream plays through headphones, the Web Audio API cannot capture the audio without additional software (e.g., virtual audio cables).

**Product identification accuracy** varies based on image quality and visibility of branding. Products with generic packaging or no visible labels may not be identified correctly.

### Future Enhancements

**User accounts and saved searches** would allow users to track products they've analyzed and revisit them later. This requires adding authentication (e.g., OAuth) and a PostgreSQL database to store search history.

**Automated price alerts** could notify users when a product they're watching drops below a certain price threshold on Amazon. This requires implementing a background job system (e.g., cron jobs) to periodically check prices.

**Multi-platform support** could extend the tool to work with other live auction platforms (e.g., eBay Live, Facebook Marketplace Live) by adapting the stream integration and product identification logic.

**Mobile app** would allow users to analyze products on their phones while watching streams on a separate device. This requires building a React Native version of the application.

**Chrome extension** could overlay the price analysis directly on the Whatnot website, eliminating the need to paste stream URLs. This requires developing a browser extension with content script injection.

---

## FAQ for New Task

### Q1: How do I handle Whatnot stream embedding if iframes are blocked?

If Whatnot blocks iframe embedding, provide clear instructions for users to open the stream in a separate browser window and use OBS or a screen capture tool to create a virtual camera feed. The application can then capture frames from the virtual camera using the existing camera integration code from "Live Product Search."

### Q2: Should I implement user authentication for the initial version?

No. The initial version should remain stateless to minimize complexity. User accounts and saved searches can be added in a future version if there is demand.

### Q3: How do I optimize image processing speed?

Resize captured images to 800x600 pixels before sending to GPT-4 Vision. This reduces API latency without significantly impacting identification accuracy. Use the HTML5 Canvas API to resize images in the browser before uploading.

### Q4: What should I do if the AI cannot identify a product?

Display a user-friendly error message such as "Could not identify product. Please recapture with clearer branding visible." Provide a "RECAPTURE" button to allow users to try again without refreshing the page.

### Q5: How do I calculate Amazon FBA fees accurately?

Use a simplified fee structure for the initial version: 15% of sale price + $3 shipping. For more accurate calculations, integrate the Amazon MWS API or provide a link to the official Amazon FBA calculator.

### Q6: Should I add keyboard shortcuts for the CAPTURE button?

Yes. Add a keyboard shortcut (e.g., Spacebar or C key) to trigger the capture action. This allows users to keep their hands on the keyboard during fast-paced auctions.

### Q7: How do I handle multiple products in a single frame?

Instruct GPT-4 Vision to identify the most prominent product in the frame. If multiple products are equally visible, return the product closest to the center of the image.

### Q8: What if ScrapingBee returns no results for a product?

Display a message such as "No Amazon listings found. Try recapturing with a different angle or search manually." Provide a link to Amazon search with the identified product name pre-filled.

### Q9: Should I add a feature to compare prices across multiple platforms (eBay, Walmart, etc.)?

Not in the initial version. Focus on Amazon comparison first, as it is the most common resale platform. Multi-platform support can be added later if there is demand.

### Q10: How do I test the application without access to a live Whatnot stream?

Use recorded Whatnot stream videos from YouTube or save sample streams locally. Test the capture and identification workflow with these recordings to verify functionality.

---

## Conclusion

Whatnot Spy is a focused, high-speed tool designed to give buyers a competitive edge during live auctions. By combining AI-powered product identification with real-time Amazon price comparisons and profit calculations, the application enables users to make informed bidding decisions in seconds. The technical architecture leverages proven components from the "Live Product Search" application while introducing new features tailored to the buyer's perspective. With careful attention to speed, accuracy, and user experience, Whatnot Spy has the potential to become an essential tool for resellers and collectors navigating the fast-paced world of live online auctions.

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Author:** Manus AI  
**Contact:** Use this specification document to start a new Manus task for building Whatnot Spy.
