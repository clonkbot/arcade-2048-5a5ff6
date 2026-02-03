import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGameState = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const gameState = await ctx.db
      .query("gameStates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return gameState;
  },
});

export const saveGameState = mutation({
  args: {
    grid: v.array(v.array(v.number())),
    score: v.number(),
    bestScore: v.number(),
    gameOver: v.boolean(),
    won: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("gameStates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        grid: args.grid,
        score: args.score,
        bestScore: args.bestScore,
        gameOver: args.gameOver,
        won: args.won,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("gameStates", {
        userId,
        grid: args.grid,
        score: args.score,
        bestScore: args.bestScore,
        gameOver: args.gameOver,
        won: args.won,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_score")
      .order("desc")
      .take(10);

    return entries;
  },
});

export const submitScore = mutation({
  args: {
    score: v.number(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      if (args.score > existing.score) {
        await ctx.db.patch(existing._id, {
          score: args.score,
          username: args.username,
          achievedAt: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("leaderboard", {
        userId,
        username: args.username,
        score: args.score,
        achievedAt: Date.now(),
      });
    }
  },
});

export const resetGame = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("gameStates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
