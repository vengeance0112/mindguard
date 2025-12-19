import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Mock Prediction Logic (Simulating Logistic Regression)
  app.post(api.predict.path, async (req, res) => {
    try {
      const input = api.predict.input.parse(req.body);
      
      // === SIMULATION LOGIC ===
      // Base score
      let score = 0;
      const contributors: { name: string; impact: number }[] = [];
      const protectors: { name: string; impact: number }[] = [];

      // 1. Psychological Factors (High impact)
      if (input.hopelessness >= 4) { score += 25; contributors.push({ name: "Hopelessness", impact: 25 }); }
      if (input.stressLevel >= 4) { score += 20; contributors.push({ name: "High Stress", impact: 20 }); }
      if (input.academicPressure >= 4) { score += 15; contributors.push({ name: "Academic Pressure", impact: 15 }); }
      if (input.sleepIssues >= 4) { score += 15; contributors.push({ name: "Sleep Issues", impact: 15 }); }

      // 2. Lifestyle Factors
      if (input.sleepHours < 5) { score += 10; contributors.push({ name: "Lack of Sleep", impact: 10 }); }
      else if (input.sleepHours > 7) { score -= 10; protectors.push({ name: "Adequate Sleep", impact: 10 }); }

      if (input.screenTime > 8) { score += 5; contributors.push({ name: "High Screen Time", impact: 5 }); }
      
      // 3. Support Factors (Protective)
      if (input.institutionalSupport >= 4) { score -= 15; protectors.push({ name: "Institutional Support", impact: 15 }); }
      if (input.financialComfort >= 4) { score -= 10; protectors.push({ name: "Financial Stability", impact: 10 }); }
      if (input.talkTo === "Counselor" || input.talkTo === "Family") { score -= 15; protectors.push({ name: "Support System", impact: 15 }); }
      if (input.openness === "Yes") { score -= 10; protectors.push({ name: "Open to Help", impact: 10 }); }
      
      // Normalize Score (0-100)
      // Base risk is around 20 for everyone
      let finalScore = 20 + score;
      finalScore = Math.max(0, Math.min(100, finalScore));

      // Determine Level
      let riskLevel: "Low" | "Medium" | "High" = "Low";
      if (finalScore >= 65) riskLevel = "High";
      else if (finalScore >= 35) riskLevel = "Medium";

      // Sort factors
      const topContributors = contributors.sort((a, b) => b.impact - a.impact).slice(0, 3).map(c => c.name);
      const topProtectors = protectors.sort((a, b) => b.impact - a.impact).slice(0, 3).map(c => c.name);

      // Return mock response
      res.json({
        riskLevel,
        riskProbability: finalScore,
        contributingFactors: topContributors.length > 0 ? topContributors : ["None identified"],
        protectiveFactors: topProtectors.length > 0 ? topProtectors : ["None identified"],
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Mock Analytics Data
  app.get(api.analytics.path, async (req, res) => {
    res.json({
      modelMetrics: {
        accuracy: 0.851,
        f1Score: 0.732,
        rocAuc: 0.925,
        logLoss: 0.358,
        totalSamples: 10000,
        featuresCount: 51,
      },
      coefficients: [
        { name: "Academic Pressure", value: 0.85, type: "Risk" },
        { name: "Stress Level", value: 0.78, type: "Risk" },
        { name: "Hopelessness", value: 0.72, type: "Risk" },
        { name: "Sleep Issues", value: 0.65, type: "Risk" },
        { name: "Screen Time > 8h", value: 0.45, type: "Risk" },
        { name: "Study Hours > 10h", value: 0.35, type: "Risk" },
        { name: "Lack of Support", value: 0.55, type: "Risk" },
        { name: "Financial Instability", value: 0.40, type: "Risk" },
        { name: "Institutional Support", value: -0.60, type: "Protective" },
        { name: "Openness: Yes", value: -0.55, type: "Protective" },
        { name: "Talk To: Counselor", value: -0.65, type: "Protective" },
        { name: "Talk To: Family", value: -0.50, type: "Protective" },
        { name: "Sleep Hours > 7h", value: -0.45, type: "Protective" },
        { name: "Outdoor Activity", value: -0.30, type: "Protective" },
        { name: "Financial Comfort", value: -0.40, type: "Protective" },
      ],
      riskDistribution: [
        { name: "Low Risk", value: 45 },
        { name: "Medium Risk", value: 35 },
        { name: "High Risk", value: 20 },
      ]
    });
  });

  return httpServer;
}
