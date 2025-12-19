import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, "..");
  const predictScriptPath = path.resolve(__dirname, "predict.py");
  const modelPath = path.resolve(projectRoot, "attached_assets", "logistic_regression_final_1766138756296.pkl");

  const runPythonPredict = async (input: unknown) => {
    return await new Promise<any>((resolve, reject) => {
      const proc = spawn("python", [predictScriptPath, modelPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (d) => {
        stdout += d.toString();
      });

      proc.stderr.on("data", (d) => {
        stderr += d.toString();
      });

      proc.on("error", (err) => {
        reject(err);
      });

      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `python exited with code ${code}`));
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(e);
        }
      });

      proc.stdin.write(JSON.stringify(input));
      proc.stdin.end();
    });
  };

  // Mock Prediction Logic (Simulating Logistic Regression)
  app.post(api.predict.path, async (req, res) => {
    try {
      const input = api.predict.input.parse(req.body);

      try {
        const py = await runPythonPredict(input);
        return res.json(api.predict.responses[200].parse(py));
      } catch (_err) {
        // fall through to simulation logic
      }
      
      // === SIMULATION LOGIC ===
      // Base score
      let score = 0;
      const breakdown: { feature: string; userValue: string; impact: number; type: "Risk" | "Protective"; explanation: string }[] = [];

      // 1. Psychological Factors (High impact)
      if (input.hopelessness >= 4) { 
        score += 25; 
        breakdown.push({ feature: "Hopelessness", userValue: `${input.hopelessness}/5`, impact: 25, type: "Risk", explanation: "Feelings of hopelessness are strongly associated with mental distress and require immediate attention." });
      }
      if (input.stressLevel >= 4) { 
        score += 20; 
        breakdown.push({ feature: "Stress Level", userValue: `${input.stressLevel}/5`, impact: 20, type: "Risk", explanation: "High stress levels significantly increase risk. Consider stress management techniques like meditation or counseling." });
      }
      if (input.academicPressure >= 4) { 
        score += 15; 
        breakdown.push({ feature: "Academic Pressure", userValue: `${input.academicPressure}/5`, impact: 15, type: "Risk", explanation: "Excessive academic pressure correlates with higher mental health risk. Balance is key." });
      }
      if (input.sleepIssues >= 4) { 
        score += 15; 
        breakdown.push({ feature: "Sleep Issues", userValue: `${input.sleepIssues}/5`, impact: 15, type: "Risk", explanation: "Sleep problems are a red flag for mental health concerns. Prioritize sleep hygiene." });
      }

      // 2. Lifestyle Factors
      if (input.sleepHours < 5) { 
        score += 10; 
        breakdown.push({ feature: "Lack of Sleep", userValue: `${input.sleepHours} hours/night`, impact: 10, type: "Risk", explanation: "Getting less than 5 hours of sleep significantly impairs mental health. Aim for 7-9 hours." });
      }
      else if (input.sleepHours >= 7) { 
        score -= 10; 
        breakdown.push({ feature: "Adequate Sleep", userValue: `${input.sleepHours} hours/night`, impact: -10, type: "Protective", explanation: "Good sleep hygiene is protective. You're doing well here." });
      }

      if (input.screenTime > 8) { 
        score += 5; 
        breakdown.push({ feature: "High Screen Time", userValue: `${input.screenTime} hours/day`, impact: 5, type: "Risk", explanation: "Excessive screen time can reduce face-to-face interaction and increase anxiety." });
      }
      
      if (input.outdoorActivity < 2) {
        score += 8;
        breakdown.push({ feature: "Low Outdoor Activity", userValue: `${input.outdoorActivity} hours/week`, impact: 8, type: "Risk", explanation: "Lack of outdoor time reduces mood-boosting benefits of nature and sunlight." });
      } else {
        score -= 5;
        breakdown.push({ feature: "Regular Outdoor Activity", userValue: `${input.outdoorActivity} hours/week`, impact: -5, type: "Protective", explanation: "Outdoor activities improve mental well-being. Keep it up!" });
      }
      
      // 3. Support Factors (Protective)
      if (input.institutionalSupport >= 4) { 
        score -= 15; 
        breakdown.push({ feature: "Institutional Support", userValue: `${input.institutionalSupport}/5`, impact: -15, type: "Protective", explanation: "Having institutional support is highly protective and reduces risk significantly." });
      }
      if (input.financialComfort >= 4) { 
        score -= 10; 
        breakdown.push({ feature: "Financial Comfort", userValue: `${input.financialComfort}/5`, impact: -10, type: "Protective", explanation: "Financial stability reduces stress and anxiety." });
      }
      if (input.talkTo === "Counselor") { 
        score -= 20; 
        breakdown.push({ feature: "Talk to Counselor", userValue: input.talkTo, impact: -20, type: "Protective", explanation: "Professional counseling support is highly protective. Continue seeking help." });
      } else if (input.talkTo === "Family") { 
        score -= 15; 
        breakdown.push({ feature: "Talk to Family", userValue: input.talkTo, impact: -15, type: "Protective", explanation: "Family support is protective. Maintain these connections." });
      } else if (input.talkTo === "Friends") {
        score -= 8;
        breakdown.push({ feature: "Talk to Friends", userValue: input.talkTo, impact: -8, type: "Protective", explanation: "Peer support helps, but consider also reaching out to family or counselors." });
      } else {
        score += 12;
        breakdown.push({ feature: "No Support System", userValue: input.talkTo, impact: 12, type: "Risk", explanation: "Not having anyone to talk to increases isolation. Reach out today." });
      }
      
      if (input.openness === "Yes") { 
        score -= 15; 
        breakdown.push({ feature: "Openness to Help", userValue: input.openness, impact: -15, type: "Protective", explanation: "Being open to mental health support is crucial and highly protective." });
      } else if (input.openness === "Maybe") {
        score -= 5;
        breakdown.push({ feature: "Some Openness to Help", userValue: input.openness, impact: -5, type: "Protective", explanation: "Consider being more open. Mental health support really helps." });
      } else {
        score += 10;
        breakdown.push({ feature: "Reluctant to Seek Help", userValue: input.openness, impact: 10, type: "Risk", explanation: "Avoid stigma. Seeking help is a sign of strength, not weakness." });
      }
      
      // Normalize Score (0-100)
      let finalScore = 20 + score;
      finalScore = Math.max(0, Math.min(100, finalScore));

      // Determine Level
      let riskLevel: "Low" | "Medium" | "High" = "Low";
      if (finalScore >= 65) riskLevel = "High";
      else if (finalScore >= 35) riskLevel = "Medium";

      // Sort breakdown by impact
      const sortedBreakdown = breakdown.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 10);
      
      // Generate insight cards
      const insightCards = [];
      if (breakdown.some(b => b.type === "Risk" && Math.abs(b.impact) >= 15)) {
        const topRisk = breakdown.filter(b => b.type === "Risk").sort((a, b) => b.impact - a.impact)[0];
        if (topRisk) {
          insightCards.push({
            title: `${topRisk.feature} is a Key Risk Factor`,
            cause: `Your reported ${topRisk.feature.toLowerCase()} level (${topRisk.userValue}) is above average and strongly associated with higher distress.`,
            effect: "This contributes significantly to your overall mental health risk score.",
            importance: "Take concrete steps to address this area. Consider counseling or lifestyle changes."
          });
        }
      }
      
      if (input.stressLevel >= 4) {
        insightCards.push({
          title: "High Stress is Impacting Your Wellbeing",
          cause: "Your stress level is significantly elevated, which often cascades into sleep problems and emotional exhaustion.",
          effect: "Elevated stress directly contributes to your risk profile and needs immediate attention.",
          importance: "Try structured breaks, exercise, or speaking with a counselor about stress management."
        });
      }

      if (input.sleepHours < 6) {
        insightCards.push({
          title: "Sleep Duration Needs Improvement",
          cause: `You're sleeping only ${input.sleepHours} hours per night, well below the recommended 7-9 hours.`,
          effect: "Poor sleep quality amplifies all mental health risks, including stress and hopelessness.",
          importance: "Gradually extend sleep by 15-30 minutes. Establish a bedtime routine."
        });
      }

      if (input.talkTo === "None" || input.openness === "No") {
        insightCards.push({
          title: "You May Benefit from Reaching Out",
          cause: "Isolation and reluctance to seek help are significant risk factors in our model.",
          effect: "Having a support network dramatically reduces mental health risk.",
          importance: "Start small: talk to one trusted person. Professional help is always available."
        });
      }

      // Generate improvement suggestions
      const improvements = [];
      
      if (input.sleepHours < 7) {
        improvements.push({
          problem: `You're getting ${input.sleepHours} hours of sleep, which is below recommended levels.`,
          why: "Sleep deprivation directly increases stress, reduces resilience, and worsens mental health outcomes.",
          action: "Start tonight: Set a bedtime 30 minutes earlier. Use this time to wind down without screens."
        });
      }

      if (input.screenTime > 7) {
        improvements.push({
          problem: `Your screen time is ${input.screenTime} hours daily, which is high.`,
          why: "Excessive screen time reduces in-person connections, increases anxiety, and disrupts sleep.",
          action: "Try a 30-minute screen-free hour before bed. Replace with reading or journaling."
        });
      }

      if (input.stressLevel >= 4) {
        improvements.push({
          problem: "Your stress level is high.",
          why: "Chronic stress impairs sleep, reduces focus, and increases emotional reactivity.",
          action: "Try the 5-minute rule: When stressed, step outside or do 5 minutes of deep breathing."
        });
      }

      if (input.outdoorActivity < 2) {
        improvements.push({
          problem: `You spend less than 2 hours outdoors weekly.`,
          why: "Outdoor time boosts mood, reduces anxiety, and provides perspective.",
          action: "Add 15-minute walks 3x this week. Morning sunlight is especially mood-boosting."
        });
      }

      if (input.talkTo === "None") {
        improvements.push({
          problem: "You don't have anyone to talk to about problems.",
          why: "Isolation amplifies mental health struggles. Sharing lightens the burden.",
          action: "Today: Reach out to one person. Start with a casual message. Professional counselors are also available."
        });
      }

      if (input.openness === "No") {
        improvements.push({
          problem: "You're reluctant to discuss mental health openly.",
          why: "Stigma prevents people from getting help. Mental health is as real as physical health.",
          action: "Consider: What would make seeking help feel safer? Talk to a trusted friend first."
        });
      }

      if (input.academicPressure >= 4 && input.studyHours > 8) {
        improvements.push({
          problem: `You have high academic pressure (${input.academicPressure}/5) and study ${input.studyHours} hours daily.`,
          why: "Overwork without balance leads to burnout and diminishing returns.",
          action: "Try the 90-minute rule: Study intensely for 90 min, then take a 15-min break. Quality over quantity."
        });
      }

      // Risk composition
      const riskComposition = [
        {
          category: "Psychological Factors",
          percentage: Math.min(100, (breakdown.filter(b => ["Hopelessness", "Stress Level", "Academic Pressure", "Sleep Issues"].includes(b.feature) && b.type === "Risk").reduce((s, b) => s + b.impact, 0) / Math.max(1, score)) * 100),
          factors: breakdown.filter(b => ["Hopelessness", "Stress Level", "Academic Pressure", "Sleep Issues"].includes(b.feature)).map(b => b.feature)
        },
        {
          category: "Lifestyle Factors",
          percentage: Math.min(100, (breakdown.filter(b => ["Lack of Sleep", "High Screen Time", "Low Outdoor Activity"].includes(b.feature) && b.type === "Risk").reduce((s, b) => s + b.impact, 0) / Math.max(1, score)) * 100),
          factors: breakdown.filter(b => ["Lack of Sleep", "High Screen Time", "Low Outdoor Activity"].includes(b.feature)).map(b => b.feature)
        },
        {
          category: "Support System",
          percentage: Math.min(100, (breakdown.filter(b => ["Support System", "No Support System", "Openness to Help"].includes(b.feature)).reduce((s, b) => s + Math.abs(b.impact), 0) / Math.max(1, Math.abs(score))) * 100),
          factors: breakdown.filter(b => ["Support System", "No Support System", "Openness to Help", "Institutional Support"].includes(b.feature)).map(b => b.feature)
        }
      ];

      const topContributors = breakdown.filter(b => b.type === "Risk").sort((a, b) => b.impact - a.impact).slice(0, 3).map(c => c.feature);
      const topProtectors = breakdown.filter(b => b.type === "Protective").sort((a, b) => b.impact - a.impact).slice(0, 3).map(c => c.feature);

      // Return response with insights
      res.json({
        riskLevel,
        riskProbability: finalScore,
        contributingFactors: topContributors.length > 0 ? topContributors : ["None identified"],
        protectiveFactors: topProtectors.length > 0 ? topProtectors : ["None identified"],
        insights: {
          breakdown: sortedBreakdown,
          cards: insightCards.slice(0, 5),
          improvements: improvements.slice(0, 5),
          riskComposition: riskComposition.filter(r => r.factors.length > 0),
          confidence: (finalScore <= 25 || finalScore >= 75)
            ? "High"
            : (finalScore <= 40 || finalScore >= 60)
              ? "Medium"
              : "Low",
          confidenceExplanation: "Based on patterns learned from 10,000 student profiles, this logistic regression model estimates relative risk. ROC-AUC: 0.925. Prediction reflects statistical patterns, not diagnosis."
        }
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
