import { db } from "./db";
import { analysis_reports, brand_missions, brand_visions, brand_values, brand_target_markets, brand_backgrounds, type Report, type InsertReport, type BrandMission, type InsertBrandMission, type BrandVision, type InsertBrandVision, type BrandValue, type InsertBrandValue, type BrandTargetMarket, type InsertBrandTargetMarket, type BrandBackground, type InsertBrandBackground } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getReports(): Promise<Report[]>;
  updateReportName(id: number, name: string): Promise<Report>;
  
  createMission(mission: InsertBrandMission): Promise<BrandMission>;
  getMissions(): Promise<BrandMission[]>;
  updateMission(id: number, mission: string): Promise<BrandMission>;
  deleteMission(id: number): Promise<void>;

  createVision(vision: InsertBrandVision): Promise<BrandVision>;
  getVisions(): Promise<BrandVision[]>;
  updateVision(id: number, vision: string): Promise<BrandVision>;
  deleteVision(id: number): Promise<void>;

  createValue(value: InsertBrandValue): Promise<BrandValue>;
  getValues(): Promise<BrandValue[]>;
  updateValue(id: number, value: string): Promise<BrandValue>;
  deleteValue(id: number): Promise<void>;

  createTargetMarket(targetMarket: InsertBrandTargetMarket): Promise<BrandTargetMarket>;
  getTargetMarkets(): Promise<BrandTargetMarket[]>;
  updateTargetMarket(id: number, targetMarket: string): Promise<BrandTargetMarket>;
  deleteTargetMarket(id: number): Promise<void>;

  createBackground(background: InsertBrandBackground): Promise<BrandBackground>;
  getBackgrounds(): Promise<BrandBackground[]>;
  updateBackground(id: number, background: string): Promise<BrandBackground>;
  deleteBackground(id: number): Promise<void>;
  
  // Auth operations are handled by replit_integrations/auth/storage.ts
}

export class DatabaseStorage implements IStorage {
  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(analysis_reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(analysis_reports)
      .where(eq(analysis_reports.id, id));
    return report;
  }

  async getReports(): Promise<Report[]> {
    return await db
      .select()
      .from(analysis_reports)
      .orderBy(desc(analysis_reports.createdAt));
  }

  async updateReportName(id: number, name: string): Promise<Report> {
    const [report] = await db
      .update(analysis_reports)
      .set({ name })
      .where(eq(analysis_reports.id, id))
      .returning();
    if (!report) throw new Error("Report not found");
    return report;
  }

  async createMission(insertMission: InsertBrandMission): Promise<BrandMission> {
    const [mission] = await db
      .insert(brand_missions)
      .values(insertMission)
      .returning();
    return mission;
  }

  async getMissions(): Promise<BrandMission[]> {
    return await db
      .select()
      .from(brand_missions)
      .orderBy(desc(brand_missions.createdAt));
  }

  async updateMission(id: number, mission: string): Promise<BrandMission> {
    const [updated] = await db
      .update(brand_missions)
      .set({ mission })
      .where(eq(brand_missions.id, id))
      .returning();
    if (!updated) throw new Error("Mission not found");
    return updated;
  }

  async deleteMission(id: number): Promise<void> {
    await db.delete(brand_missions).where(eq(brand_missions.id, id));
  }

  async createVision(insertVision: InsertBrandVision): Promise<BrandVision> {
    const [vision] = await db
      .insert(brand_visions)
      .values(insertVision)
      .returning();
    return vision;
  }

  async getVisions(): Promise<BrandVision[]> {
    return await db
      .select()
      .from(brand_visions)
      .orderBy(desc(brand_visions.createdAt));
  }

  async updateVision(id: number, vision: string): Promise<BrandVision> {
    const [updated] = await db
      .update(brand_visions)
      .set({ vision })
      .where(eq(brand_visions.id, id))
      .returning();
    if (!updated) throw new Error("Vision not found");
    return updated;
  }

  async deleteVision(id: number): Promise<void> {
    await db.delete(brand_visions).where(eq(brand_visions.id, id));
  }

  async createValue(insertValue: InsertBrandValue): Promise<BrandValue> {
    const [value] = await db
      .insert(brand_values)
      .values(insertValue)
      .returning();
    return value;
  }

  async getValues(): Promise<BrandValue[]> {
    return await db
      .select()
      .from(brand_values)
      .orderBy(desc(brand_values.createdAt));
  }

  async updateValue(id: number, valueProposition: string): Promise<BrandValue> {
    const [updated] = await db
      .update(brand_values)
      .set({ valueProposition })
      .where(eq(brand_values.id, id))
      .returning();
    if (!updated) throw new Error("Value proposition not found");
    return updated;
  }

  async deleteValue(id: number): Promise<void> {
    await db.delete(brand_values).where(eq(brand_values.id, id));
  }

  async createTargetMarket(insertTargetMarket: InsertBrandTargetMarket): Promise<BrandTargetMarket> {
    const [targetMarket] = await db
      .insert(brand_target_markets)
      .values(insertTargetMarket)
      .returning();
    return targetMarket;
  }

  async getTargetMarkets(): Promise<BrandTargetMarket[]> {
    return await db
      .select()
      .from(brand_target_markets)
      .orderBy(desc(brand_target_markets.createdAt));
  }

  async updateTargetMarket(id: number, targetMarket: string): Promise<BrandTargetMarket> {
    const [updated] = await db
      .update(brand_target_markets)
      .set({ targetMarket })
      .where(eq(brand_target_markets.id, id))
      .returning();
    if (!updated) throw new Error("Target market not found");
    return updated;
  }

  async deleteTargetMarket(id: number): Promise<void> {
    await db.delete(brand_target_markets).where(eq(brand_target_markets.id, id));
  }

  async createBackground(insertBackground: InsertBrandBackground): Promise<BrandBackground> {
    const [background] = await db
      .insert(brand_backgrounds)
      .values(insertBackground)
      .returning();
    return background;
  }

  async getBackgrounds(): Promise<BrandBackground[]> {
    return await db
      .select()
      .from(brand_backgrounds)
      .orderBy(desc(brand_backgrounds.createdAt));
  }

  async updateBackground(id: number, background: string): Promise<BrandBackground> {
    const [updated] = await db
      .update(brand_backgrounds)
      .set({ background })
      .where(eq(brand_backgrounds.id, id))
      .returning();
    if (!updated) throw new Error("Background not found");
    return updated;
  }

  async deleteBackground(id: number): Promise<void> {
    await db.delete(brand_backgrounds).where(eq(brand_backgrounds.id, id));
  }
}

export const storage = new DatabaseStorage();
