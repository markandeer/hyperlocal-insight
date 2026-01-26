import express, { type Express } from 'express';
import { storage } from './storage';
import { stripeService } from './stripeService';
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { generateMarketAnalysis, generateMissionStatement, generateVisionStatement, generateValueProposition, generateTargetMarket, generateLiveInsights, generateBackground } from "./openai";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function registerRoutes(httpServer: any, app: Express): Promise<any> {
  // Setup auth and register auth routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // Create customer portal session
  app.post("/api/checkout/portal", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = await storage.getUser(req.user.id);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ message: "No customer ID found" });
    }
    try {
      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${req.protocol}://${req.get("host")}/settings`
      );
      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.patch("/api/user/stripe-info", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const updatedUser = await storage.updateUserStripeInfo(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user stripe info" });
    }
  });

  // Get user subscription
  app.get('/api/subscription', async (req: any, res) => {
    if (!req.isAuthenticated()) return res.json({ subscription: null });
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }
      const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
      res.json({ subscription });
    } catch (error) {
      console.error("Subscription fetch error:", error);
      res.json({ subscription: null });
    }
  });

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

  app.post("/api/missions", async (req: any, res) => {
    try {
      const { mission, originalInput } = req.body;
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      if (!mission || !originalInput) {
        return res.status(400).json({ message: "Mission and input are required" });
      }
      const savedMission = await storage.createMission(req.user.id, { mission, originalInput });
      res.status(201).json(savedMission);
    } catch (error) {
      res.status(500).json({ message: "Failed to save mission" });
    }
  });

  app.get("/api/missions", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const missions = await storage.getMissions(req.user.id);
      res.json(missions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  app.patch("/api/missions/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      const { mission } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedMission = await storage.updateMission(id, req.user.id, mission);
      res.json(updatedMission);
    } catch (error) {
      res.status(500).send("Failed to update mission");
    }
  });

  app.delete("/api/missions/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteMission(id, req.user.id);
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

  app.post("/api/visions", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const { vision, originalInput } = req.body;
      if (!vision || !originalInput) {
        return res.status(400).json({ message: "Vision and input are required" });
      }
      const savedVision = await storage.createVision(req.user.id, { vision, originalInput });
      res.status(201).json(savedVision);
    } catch (error) {
      res.status(500).json({ message: "Failed to save vision" });
    }
  });

  app.get("/api/visions", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const visions = await storage.getVisions(req.user.id);
      res.json(visions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visions" });
    }
  });

  app.patch("/api/visions/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      const { vision } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedVision = await storage.updateVision(id, req.user.id, vision);
      res.json(updatedVision);
    } catch (error) {
      res.status(500).send("Failed to update vision");
    }
  });

  app.delete("/api/visions/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteVision(id, req.user.id);
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

  app.post("/api/values", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const { valueProposition, originalInput } = req.body;
      if (!valueProposition || !originalInput) {
        return res.status(400).json({ message: "Value proposition and input are required" });
      }
      const savedValue = await storage.createValue(req.user.id, { valueProposition, originalInput });
      res.status(201).json(savedValue);
    } catch (error) {
      res.status(500).json({ message: "Failed to save value proposition" });
    }
  });

  app.get("/api/values", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const values = await storage.getValues(req.user.id);
      res.json(values);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch value propositions" });
    }
  });

  app.patch("/api/values/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      const { valueProposition } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedValue = await storage.updateValue(id, req.user.id, valueProposition);
      res.json(updatedValue);
    } catch (error) {
      res.status(500).send("Failed to update value proposition");
    }
  });

  app.delete("/api/values/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteValue(id, req.user.id);
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

  app.post("/api/target-markets", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const { targetMarket, originalInput } = req.body;
      if (!targetMarket || !originalInput) {
        return res.status(400).json({ message: "Target market and input are required" });
      }
      const savedTargetMarket = await storage.createTargetMarket(req.user.id, { targetMarket, originalInput });
      res.status(201).json(savedTargetMarket);
    } catch (error) {
      res.status(500).json({ message: "Failed to save target market profile" });
    }
  });

  app.get("/api/target-markets", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const targetMarkets = await storage.getTargetMarkets(req.user.id);
      res.json(targetMarkets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch target market profiles" });
    }
  });

  app.patch("/api/target-markets/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      const { targetMarket } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedTargetMarket = await storage.updateTargetMarket(id, req.user.id, targetMarket);
      res.json(updatedTargetMarket);
    } catch (error) {
      res.status(500).send("Failed to update target market profile");
    }
  });

  app.delete("/api/target-markets/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteTargetMarket(id, req.user.id);
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

  app.post("/api/backgrounds", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const { background, originalInput } = req.body;
      if (!background || !originalInput) {
        return res.status(400).json({ message: "Background and input are required" });
      }
      const savedBackground = await storage.createBackground(req.user.id, { background, originalInput });
      res.status(201).json(savedBackground);
    } catch (error) {
      res.status(500).json({ message: "Failed to save business background" });
    }
  });

  app.get("/api/backgrounds", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const backgrounds = await storage.getBackgrounds(req.user.id);
      res.json(backgrounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business backgrounds" });
    }
  });

  app.patch("/api/backgrounds/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      const { background } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const updatedBackground = await storage.updateBackground(id, req.user.id, background);
      res.json(updatedBackground);
    } catch (error) {
      res.status(500).send("Failed to update business background");
    }
  });

  app.delete("/api/backgrounds/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      await storage.deleteBackground(id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete business background");
    }
  });

  // API Routes
  app.post("/api/reports/analyze", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const { address, businessType } = req.body;
      
      if (!address || !businessType) {
        return res.status(400).json({ message: "Address and Business Type are required" });
      }

      console.log(`Starting analysis for ${businessType} at ${address}`);
      
      // Generate analysis using OpenAI
      const analysisData = await generateMarketAnalysis(address, businessType);
      
      // Save to database
      const report = await storage.createReport(req.user.id, {
        address,
        businessType,
        data: analysisData,
        userId: req.user.id
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({ message: "Failed to generate analysis" });
    }
  });

  app.get("/api/reports", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const reports = await storage.getReports(req.user.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const report = await storage.getReport(id, req.user.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.patch("/api/reports/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      
      const updatedReport = await storage.updateReportName(id, req.user.id, name);
      res.json(updatedReport);
    } catch (error) {
      res.status(500).send("Failed to update report");
    }
  });

  app.get("/api/live-insights/:id", async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const report = await storage.getReport(id, req.user.id);
    if (!report) return res.status(404).send("Report not found");

    try {
      const insights = await generateLiveInsights(report.address, report.businessType);
      res.json(insights);
    } catch (error) {
      console.error("Live insights error:", error);
      res.status(500).send("Failed to generate live insights");
    }
  });

  return httpServer;
}
