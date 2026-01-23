import { db } from "./db";
import { analysis_reports, brand_missions, brand_visions, brand_values, type Report, type InsertReport, type BrandMission, type InsertBrandMission, type BrandVision, type InsertBrandVision, type BrandValue, type InsertBrandValue } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
