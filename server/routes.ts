import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMarketAnalysis, generateMissionStatement, generateVisionStatement, generateValueProposition, generateTargetMarket, generateLiveInsights } from "./openai";
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

  app.patch("/api/missions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { mission } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedMission = await storage.updateMission(id, mission);
      res.json(updatedMission);
    } catch (error) {
      res.status(500).send("Failed to update mission");
    }
  });

  app.delete("/api/missions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteMission(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete mission");
    }
  });

  // Vision statement routes
  app.post("/api/generate-vision", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Input is required" });
      }
      const vision = await generateVisionStatement(input);
      res.json({ vision });
    } catch (error: any) {
      console.error("Vision generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate vision statement" });
    }
  });

  app.post("/api/visions", async (req, res) => {
    try {
      const { vision, originalInput } = req.body;
      if (!vision || !originalInput) {
        return res.status(400).json({ message: "Vision and input are required" });
      }
      const savedVision = await storage.createVision({ vision, originalInput });
      res.status(201).json(savedVision);
    } catch (error) {
      res.status(500).json({ message: "Failed to save vision" });
    }
  });

  app.get("/api/visions", async (_req, res) => {
    try {
      const visions = await storage.getVisions();
      res.json(visions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visions" });
    }
  });

  app.patch("/api/visions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { vision } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedVision = await storage.updateVision(id, vision);
      res.json(updatedVision);
    } catch (error) {
      res.status(500).send("Failed to update vision");
    }
  });

  app.delete("/api/visions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteVision(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete vision");
    }
  });

  // Value proposition routes
  app.post("/api/generate-value", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Input is required" });
      }
      const value = await generateValueProposition(input);
      res.json({ value });
    } catch (error: any) {
      console.error("Value proposition generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate value proposition" });
    }
  });

  app.post("/api/values", async (req, res) => {
    try {
      const { valueProposition, originalInput } = req.body;
      if (!valueProposition || !originalInput) {
        return res.status(400).json({ message: "Value proposition and input are required" });
      }
      const savedValue = await storage.createValue({ valueProposition, originalInput });
      res.status(201).json(savedValue);
    } catch (error) {
      res.status(500).json({ message: "Failed to save value proposition" });
    }
  });

  app.get("/api/values", async (_req, res) => {
    try {
      const values = await storage.getValues();
      res.json(values);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch value propositions" });
    }
  });

  app.patch("/api/values/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { valueProposition } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedValue = await storage.updateValue(id, valueProposition);
      res.json(updatedValue);
    } catch (error) {
      res.status(500).send("Failed to update value proposition");
    }
  });

  app.delete("/api/values/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteValue(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete value proposition");
    }
  });

  // Target market routes
  app.post("/api/generate-target", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Input is required" });
      }
      const targetMarket = await generateTargetMarket(input);
      res.json({ targetMarket });
    } catch (error: any) {
      console.error("Target market generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate target market profile" });
    }
  });

  app.post("/api/target-markets", async (req, res) => {
    try {
      const { targetMarket, originalInput } = req.body;
      if (!targetMarket || !originalInput) {
        return res.status(400).json({ message: "Target market and input are required" });
      }
      const savedTargetMarket = await storage.createTargetMarket({ targetMarket, originalInput });
      res.status(201).json(savedTargetMarket);
    } catch (error) {
      res.status(500).json({ message: "Failed to save target market profile" });
    }
  });

  app.get("/api/target-markets", async (_req, res) => {
    try {
      const targetMarkets = await storage.getTargetMarkets();
      res.json(targetMarkets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch target market profiles" });
    }
  });

  app.patch("/api/target-markets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { targetMarket } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedTargetMarket = await storage.updateTargetMarket(id, targetMarket);
      res.json(updatedTargetMarket);
    } catch (error) {
      res.status(500).send("Failed to update target market profile");
    }
  });

  app.delete("/api/target-markets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteTargetMarket(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete target market profile");
    }
  });

  // Business background routes
  app.post("/api/generate-background", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Input is required" });
      }
      const background = await generateBackground(input);
      res.json({ background });
    } catch (error: any) {
      console.error("Background refinement error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to refine business background" });
    }
  });

  app.post("/api/backgrounds", async (req, res) => {
    try {
      const { background, originalInput } = req.body;
      if (!background || !originalInput) {
        return res.status(400).json({ message: "Background and input are required" });
      }
      const savedBackground = await storage.createBackground({ background, originalInput });
      res.status(201).json(savedBackground);
    } catch (error) {
      res.status(500).json({ message: "Failed to save business background" });
    }
  });

  app.get("/api/backgrounds", async (_req, res) => {
    try {
      const backgrounds = await storage.getBackgrounds();
      res.json(backgrounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business backgrounds" });
    }
  });

  app.patch("/api/backgrounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { background } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedBackground = await storage.updateBackground(id, background);
      res.json(updatedBackground);
    } catch (error) {
      res.status(500).send("Failed to update business background");
    }
  });

  app.delete("/api/backgrounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteBackground(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete business background");
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

  app.get("/api/live-insights/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const report = await storage.getReport(id);
    if (!report) return res.status(404).send("Report not found");

    try {
      const { generateLiveInsights } = await import("./openai");
      const insights = await generateLiveInsights(report.address, report.businessType);
      res.json(insights);
    } catch (error) {
      console.error("Live insights error:", error);
      res.status(500).send("Failed to generate live insights");
    }
  });

  // Seed on startup
  seedDatabase().catch(err => console.error("Seeding failed:", err));

  return httpServer;
}
