import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMarketAnalysis } from "./openai";
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

  // Seed on startup
  seedDatabase().catch(err => console.error("Seeding failed:", err));

  return httpServer;
}
