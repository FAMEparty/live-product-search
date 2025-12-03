import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { extractProductName } from "./services/productExtractor";
import { searchAmazonProduct, searchAmazonProducts } from "./services/amazonScraper";
import { analyzeProductImage } from "./services/visionAnalyzer";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Amazon product search with hybrid AI extraction (vision + voice) and real scraping
  amazon: router({
    search: publicProcedure
      .input(z.object({ 
        query: z.string(),
        image: z.string().optional() // Base64 encoded image
      }))
      .mutation(async ({ input }) => {
        const { query, image } = input;
        
        let extractedFromVoice = "";
        let extractedFromVision = "";
        let finalProductName = "";
        
        // Step 1: Extract from voice (if provided)
        if (query && query.trim().length > 0) {
          extractedFromVoice = await extractProductName(query);
        }
        
        // Step 2: Extract from image (if provided)
        if (image) {
          extractedFromVision = await analyzeProductImage(image);
        }
        
        // Step 3: Combine results (vision takes priority if both exist)
        if (extractedFromVision && extractedFromVoice) {
          // Hybrid: combine both for maximum accuracy
          finalProductName = `${extractedFromVision} ${extractedFromVoice}`.trim();
        } else if (extractedFromVision) {
          finalProductName = extractedFromVision;
        } else if (extractedFromVoice) {
          finalProductName = extractedFromVoice;
        } else {
          finalProductName = query; // Fallback to original
        }
        
        // Step 4: Use ScrapingBee to fetch multiple Amazon product options
        const products = await searchAmazonProducts(finalProductName);
        
        // Return top 3 products with AI extraction metadata
        return {
          products: products.slice(0, 3),
          originalQuery: query,
          extractedFromVoice,
          extractedFromVision,
          finalQuery: finalProductName,
          capturedImage: image, // Return the captured image for preview
        };
      }),
  }),

  // Stream Deck webhook endpoints
  streamdeck: router({
    startListen: publicProcedure.mutation(() => {
      // This will be called by Stream Deck via HTTP POST
      return { action: 'start_listen', success: true };
    }),
    pushLive: publicProcedure.mutation(() => {
      // This will be called by Stream Deck via HTTP POST
      return { action: 'push_live', success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
