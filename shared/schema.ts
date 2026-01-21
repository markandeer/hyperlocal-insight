import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analysis_reports = pgTable("analysis_reports", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  businessType: text("business_type").notNull(),
  data: jsonb("data").notNull(), // Stores the full analysis JSON
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(analysis_reports).omit({ 
  id: true, 
  createdAt: true 
});

export type Report = typeof analysis_reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

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
});

export type AnalysisData = z.infer<typeof analysisDataSchema>;
