import { db } from "./db";
import { users, analysis_reports, brand_missions, brand_visions, brand_values, brand_target_markets, brand_backgrounds, type Report, type InsertReport, type BrandMission, type InsertBrandMission, type BrandVision, type InsertBrandVision, type BrandValue, type InsertBrandValue, type BrandTargetMarket, type InsertBrandTargetMarket, type BrandBackground, type InsertBrandBackground } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  createReport(userId: string, report: InsertReport): Promise<Report>;
  getReport(id: number, userId: string): Promise<Report | undefined>;
  getReports(userId: string): Promise<Report[]>;
  updateReportName(id: number, userId: string, name: string): Promise<Report>;
  
  createMission(userId: string, mission: InsertBrandMission): Promise<BrandMission>;
  getMissions(userId: string): Promise<BrandMission[]>;
  updateMission(id: number, userId: string, mission: string): Promise<BrandMission>;
  deleteMission(id: number, userId: string): Promise<void>;

  createVision(userId: string, vision: InsertBrandVision): Promise<BrandVision>;
  getVisions(userId: string): Promise<BrandVision[]>;
  updateVision(id: number, userId: string, vision: string): Promise<BrandVision>;
  deleteVision(id: number, userId: string): Promise<void>;

  createValue(userId: string, value: InsertBrandValue): Promise<BrandValue>;
  getValues(userId: string): Promise<BrandValue[]>;
  updateValue(id: number, userId: string, value: string): Promise<BrandValue>;
  deleteValue(id: number, userId: string): Promise<void>;

  createTargetMarket(userId: string, targetMarket: InsertBrandTargetMarket): Promise<BrandTargetMarket>;
  getTargetMarkets(userId: string): Promise<BrandTargetMarket[]>;
  updateTargetMarket(id: number, userId: string, targetMarket: string): Promise<BrandTargetMarket>;
  deleteTargetMarket(id: number, userId: string): Promise<void>;

  createBackground(userId: string, background: InsertBrandBackground): Promise<BrandBackground>;
  getBackgrounds(userId: string): Promise<BrandBackground[]>;
  updateBackground(id: number, userId: string, background: string): Promise<BrandBackground>;
  deleteBackground(id: number, userId: string): Promise<void>;
  
  // Auth operations
  getUser(id: string): Promise<any>;
  updateUserStripeInfo(id: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async createReport(userId: string, insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(analysis_reports)
      .values({ ...insertReport, userId })
      .returning();
    return report;
  }

  async getReport(id: number, userId: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(analysis_reports)
      .where(sql`${analysis_reports.id} = ${id} AND ${analysis_reports.userId} = ${userId}`);
    return report;
  }

  async getReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(analysis_reports)
      .where(eq(analysis_reports.userId, userId))
      .orderBy(desc(analysis_reports.createdAt));
  }

  async updateReportName(id: number, userId: string, name: string): Promise<Report> {
    const [report] = await db
      .update(analysis_reports)
      .set({ name })
      .where(sql`${analysis_reports.id} = ${id} AND ${analysis_reports.userId} = ${userId}`)
      .returning();
    if (!report) throw new Error("Report not found");
    return report;
  }

  async createMission(userId: string, insertMission: InsertBrandMission): Promise<BrandMission> {
    const [mission] = await db
      .insert(brand_missions)
      .values({ ...insertMission, userId })
      .returning();
    return mission;
  }

  async getMissions(userId: string): Promise<BrandMission[]> {
    return await db
      .select()
      .from(brand_missions)
      .where(eq(brand_missions.userId, userId))
      .orderBy(desc(brand_missions.createdAt));
  }

  async updateMission(id: number, userId: string, mission: string): Promise<BrandMission> {
    const [updated] = await db
      .update(brand_missions)
      .set({ mission })
      .where(sql`${brand_missions.id} = ${id} AND ${brand_missions.userId} = ${userId}`)
      .returning();
    if (!updated) throw new Error("Mission not found");
    return updated;
  }

  async deleteMission(id: number, userId: string): Promise<void> {
    await db.delete(brand_missions).where(sql`${brand_missions.id} = ${id} AND ${brand_missions.userId} = ${userId}`);
  }

  async createVision(userId: string, insertVision: InsertBrandVision): Promise<BrandVision> {
    const [vision] = await db
      .insert(brand_visions)
      .values({ ...insertVision, userId })
      .returning();
    return vision;
  }

  async getVisions(userId: string): Promise<BrandVision[]> {
    return await db
      .select()
      .from(brand_visions)
      .where(eq(brand_visions.userId, userId))
      .orderBy(desc(brand_visions.createdAt));
  }

  async updateVision(id: number, userId: string, vision: string): Promise<BrandVision> {
    const [updated] = await db
      .update(brand_visions)
      .set({ vision })
      .where(sql`${brand_visions.id} = ${id} AND ${brand_visions.userId} = ${userId}`)
      .returning();
    if (!updated) throw new Error("Vision not found");
    return updated;
  }

  async deleteVision(id: number, userId: string): Promise<void> {
    await db.delete(brand_visions).where(sql`${brand_visions.id} = ${id} AND ${brand_visions.userId} = ${userId}`);
  }

  async createValue(userId: string, insertValue: InsertBrandValue): Promise<BrandValue> {
    const [value] = await db
      .insert(brand_values)
      .values({ ...insertValue, userId })
      .returning();
    return value;
  }

  async getValues(userId: string): Promise<BrandValue[]> {
    return await db
      .select()
      .from(brand_values)
      .where(eq(brand_values.userId, userId))
      .orderBy(desc(brand_values.createdAt));
  }

  async updateValue(id: number, userId: string, valueProposition: string): Promise<BrandValue> {
    const [updated] = await db
      .update(brand_values)
      .set({ valueProposition })
      .where(sql`${brand_values.id} = ${id} AND ${brand_values.userId} = ${userId}`)
      .returning();
    if (!updated) throw new Error("Value proposition not found");
    return updated;
  }

  async deleteValue(id: number, userId: string): Promise<void> {
    await db.delete(brand_values).where(sql`${brand_values.id} = ${id} AND ${brand_values.userId} = ${userId}`);
  }

  async createTargetMarket(userId: string, insertTargetMarket: InsertBrandTargetMarket): Promise<BrandTargetMarket> {
    const [targetMarket] = await db
      .insert(brand_target_markets)
      .values({ ...insertTargetMarket, userId })
      .returning();
    return targetMarket;
  }

  async getTargetMarkets(userId: string): Promise<BrandTargetMarket[]> {
    return await db
      .select()
      .from(brand_target_markets)
      .where(eq(brand_target_markets.userId, userId))
      .orderBy(desc(brand_target_markets.createdAt));
  }

  async updateTargetMarket(id: number, userId: string, targetMarket: string): Promise<BrandTargetMarket> {
    const [updated] = await db
      .update(brand_target_markets)
      .set({ targetMarket })
      .where(sql`${brand_target_markets.id} = ${id} AND ${brand_target_markets.userId} = ${userId}`)
      .returning();
    if (!updated) throw new Error("Target market not found");
    return updated;
  }

  async deleteTargetMarket(id: number, userId: string): Promise<void> {
    await db.delete(brand_target_markets).where(sql`${brand_target_markets.id} = ${id} AND ${brand_target_markets.userId} = ${userId}`);
  }

  async createBackground(userId: string, insertBackground: InsertBrandBackground): Promise<BrandBackground> {
    const [background] = await db
      .insert(brand_backgrounds)
      .values({ ...insertBackground, userId })
      .returning();
    return background;
  }

  async getBackgrounds(userId: string): Promise<BrandBackground[]> {
    return await db
      .select()
      .from(brand_backgrounds)
      .where(eq(brand_backgrounds.userId, userId))
      .orderBy(desc(brand_backgrounds.createdAt));
  }

  async updateBackground(id: number, userId: string, background: string): Promise<BrandBackground> {
    const [updated] = await db
      .update(brand_backgrounds)
      .set({ background })
      .where(sql`${brand_backgrounds.id} = ${id} AND ${brand_backgrounds.userId} = ${userId}`)
      .returning();
    if (!updated) throw new Error("Background not found");
    return updated;
  }

  async deleteBackground(id: number, userId: string): Promise<void> {
    await db.delete(brand_backgrounds).where(sql`${brand_backgrounds.id} = ${id} AND ${brand_backgrounds.userId} = ${userId}`);
  }

  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }) {
    const [user] = await db.update(users).set(stripeInfo).where(eq(users.id, userId)).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
