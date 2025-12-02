import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("amazon.search", () => {
  it("returns product data for a valid query", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.amazon.search({ query: "Nike Air Max" });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("price");
    expect(result).toHaveProperty("image");
    expect(result).toHaveProperty("url");
    expect(result.title).toContain("Nike Air Max");
    expect(result.url).toContain("amazon.com");
  });

  it("encodes special characters in search URL", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.amazon.search({ query: "Product & Test" });

    // encodeURIComponent uses %20 for spaces and %26 for &
    expect(result.url).toContain("Product%20%26%20Test");
  });
});
