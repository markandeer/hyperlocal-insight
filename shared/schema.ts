import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analysis_reports = pgTable("analysis_reports", {
  id: serial("id").primaryKey(),
  name: text("name"), // Optional custom name for the report
  address: text("address").notNull(),
  businessType: text("business_type").notNull(),
  data: jsonb("data").notNull(), // Stores the full analysis JSON
  createdAt: timestamp("created_at").defaultNow(),
});

export const brand_missions = pgTable("brand_missions", {
  id: serial("id").primaryKey(),
  mission: text("mission").notNull(),
  originalInput: text("original_input").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brand_visions = pgTable("brand_visions", {
  id: serial("id").primaryKey(),
  vision: text("vision").notNull(),
  originalInput: text("original_input").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brand_values = pgTable("brand_values", {
  id: serial("id").primaryKey(),
  valueProposition: text("value_proposition").notNull(),
  originalInput: text("original_input").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brand_target_markets = pgTable("brand_target_markets", {
  id: serial("id").primaryKey(),
  targetMarket: text("target_market").notNull(),
  originalInput: text("original_input").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brand_backgrounds = pgTable("brand_backgrounds", {
  id: serial("id").primaryKey(),
  background: text("background").notNull(),
  originalInput: text("original_input").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(analysis_reports).omit({ 
  id: true, 
  createdAt: true 
});

export const insertMissionSchema = createInsertSchema(brand_missions).omit({
  id: true,
  createdAt: true
});

export const insertVisionSchema = createInsertSchema(brand_visions).omit({
  id: true,
  createdAt: true
});

export const insertValueSchema = createInsertSchema(brand_values).omit({
  id: true,
  createdAt: true
});

export const insertTargetMarketSchema = createInsertSchema(brand_target_markets).omit({
  id: true,
  createdAt: true
});

export const insertBackgroundSchema = createInsertSchema(brand_backgrounds).omit({
  id: true,
  createdAt: true
});

export type Report = typeof analysis_reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type BrandMission = typeof brand_missions.$inferSelect;
export type InsertBrandMission = z.infer<typeof insertMissionSchema>;
export type BrandVision = typeof brand_visions.$inferSelect;
export type InsertBrandVision = z.infer<typeof insertVisionSchema>;
export type BrandValue = typeof brand_values.$inferSelect;
export type InsertBrandValue = z.infer<typeof insertValueSchema>;
export type BrandTargetMarket = typeof brand_target_markets.$inferSelect;
export type InsertBrandTargetMarket = z.infer<typeof insertTargetMarketSchema>;
export type BrandBackground = typeof brand_backgrounds.$inferSelect;
export type InsertBrandBackground = z.infer<typeof insertBackgroundSchema>;

// Define the structure of the AI analysis data for type safety on frontend
export const analysisDataSchema = z.object({
  marketSize: z.object({
    tam: z.object({ value: z.number(), description: z.string() }),
    sam: z.object({ value: z.number(), description: z.string() }),
    som: z.object({ value: z.number(), description: z.string() }),
  }),
  demographics: z.object({
    population: z.number(),
    medianIncome: z.number(),
    ageGroups: z.array(z.object({ range: z.string(), percentage: z.number() })),
    description: z.string(),
  }),
  psychographics: z.object({
    interests: z.array(z.string()),
    lifestyle: z.string(),
    buyingBehavior: z.string(),
  }),
  weather: z.object({
    seasonalTrends: z.string(),
    impactOnBusiness: z.string(),
  }),
  traffic: z.object({
    typicalTraffic: z.string(),
    challenges: z.array(z.string()),
    peakHours: z.string(),
  }),
  gentrification: z.object({
    score: z.number().min(1).max(10),
    description: z.string(),
  }),
  politicalLeanings: z.object({
    leaning: z.string(),
    description: z.string(),
  }),
});

export type AnalysisData = z.infer<typeof analysisDataSchema>;
