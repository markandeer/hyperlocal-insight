import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMarketAnalysis, generateMissionStatement } from "./openai";
import { insertReportSchema } from "@shared/schema";
import { z } from "zod";

async function seedDatabase() {
  const existingReports = await storage.getReports();
  if (existingReports.length === 0) {
    console.log("Seeding database with sample report...");
    await storage.createReport({
      address: "210 S Desplaines St, Chicago, IL 60661",
      businessType: "Marketing Agency",
      data: {
        marketSize: {
          tam: { value: 50000000, description: "Total addressable market for digital marketing in Chicago metro area." },
          sam: { value: 15000000, description: "Serviceable market within downtown Chicago business district." },
          som: { value: 3000000, description: "Realistic obtainable market share based on current competition." }
        },
        demographics: {
          population: 45000,
          medianIncome: 110000,
          ageGroups: [
            { range: "18-24", percentage: 15 },
            { range: "25-34", percentage: 40 },
            { range: "35-44", percentage: 25 },
            { range: "45-54", percentage: 15 },
            { range: "55+", percentage: 5 }
          ],
          description: "Young, affluent professionals living in high-rise apartments."
        },
        psychographics: {
          interests: ["Technology", "Business", "Fine Dining", "Fitness"],
          lifestyle: "Fast-paced, career-focused, digitally connected.",
          buyingBehavior: "Values quality and convenience, high disposable income."
        },
        weather: {
          seasonalTrends: "Harsh winters reduce foot traffic; vibrant summer activity.",
          impactOnBusiness: "Digital services remain stable; local events peak in summer."
        },
        traffic: {
          typicalTraffic: "Heavy congestion during rush hours.",
          challenges: ["Limited parking", "Construction delays"],
          peakHours: "8-9 AM, 5-6 PM"
        }
      }
    });
    console.log("Database seeded successfully.");
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Mission statement generation
  app.post("/api/generate-mission", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Input is required" });
      }
      const mission = await generateMissionStatement(input);
      res.json({ mission });
    } catch (error: any) {
      console.error("Mission generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate mission statement" });
    }
  });

  app.post("/api/missions", async (req, res) => {
    try {
      const { mission, originalInput } = req.body;
      if (!mission || !originalInput) {
        return res.status(400).json({ message: "Mission and input are required" });
      }
      const savedMission = await storage.createMission({ mission, originalInput });
      res.status(201).json(savedMission);
    } catch (error) {
      res.status(500).json({ message: "Failed to save mission" });
    }
  });

  app.get("/api/missions", async (_req, res) => {
    try {
      const missions = await storage.getMissions();
      res.json(missions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  // API Routes
  app.post("/api/reports/analyze", async (req, res) => {
    try {
      const { address, businessType } = req.body;
      
      if (!address || !businessType) {
        return res.status(400).json({ message: "Address and Business Type are required" });
      }

      console.log(`Starting analysis for ${businessType} at ${address}`);
      
      // Generate analysis using OpenAI
      const analysisData = await generateMarketAnalysis(address, businessType);
      
      // Save to database
      const report = await storage.createReport({
        address,
        businessType,
        data: analysisData
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({ message: "Failed to generate analysis" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.patch("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      
      const updatedReport = await storage.updateReportName(id, name);
      res.json(updatedReport);
    } catch (error) {
      res.status(500).send("Failed to update report");
    }
  });

  // Seed on startup
  seedDatabase().catch(err => console.error("Seeding failed:", err));

  return httpServer;
}
