import { db } from "./db";
import { analysis_reports, brand_missions, type Report, type InsertReport, type BrandMission, type InsertBrandMission } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
