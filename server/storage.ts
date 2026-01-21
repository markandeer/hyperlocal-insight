import { db } from "./db";
import { analysis_reports, type Report, type InsertReport } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getReports(): Promise<Report[]>;
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
}

export const storage = new DatabaseStorage();
