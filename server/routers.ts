import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

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

  // Amazon product search
  amazon: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ input }) => {
        const { query } = input;
        
        // For now, return a formatted Amazon search URL
        // In the future, we can scrape the page or use an API
        const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
        
        // Mock data for now (replace with real scraping later)
        return {
          title: `Amazon: ${query}`,
          price: "$129.99",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
          url: searchUrl
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
