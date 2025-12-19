import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
// We'll store predictions to show a "Recent Assessments" list if needed, 
// or just to have a valid schema for the form.
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  
  // Step 1: Lifestyle Metrics
  age: integer("age").notNull(),
  studyHours: integer("study_hours").notNull(),
  sleepHours: integer("sleep_hours").notNull(),
  screenTime: integer("screen_time").notNull(),
  outdoorActivity: integer("outdoor_activity").notNull(), // hours

  // Step 2: Personal & Support
  gender: text("gender").notNull(), // Male, Female, Other
  academicLevel: text("academic_level").notNull(), // High School, Undergrad, Postgrad
  talkTo: text("talk_to").notNull(), // Family, Friends, Counselor, None
  openness: text("openness").notNull(), // Yes, Maybe, No

  // Step 3: Psychological Scales (1-5)
  academicPressure: integer("academic_pressure").notNull(),
  stressLevel: integer("stress_level").notNull(),
  sleepIssues: integer("sleep_issues").notNull(),
  hopelessness: integer("hopelessness").notNull(),
  financialComfort: integer("financial_comfort").notNull(),
  institutionalSupport: integer("institutional_support").notNull(),

  // Result (Calculated)
  riskLevel: text("risk_level"), // Low, Medium, High
  riskScore: integer("risk_score"), // 0-100 probability
  timestamp: text("timestamp").default("now()"),
});

// === SCHEMAS ===
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ 
  id: true, 
  riskLevel: true, 
  riskScore: true, 
  timestamp: true 
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

// === API TYPES ===
export type PredictRequest = InsertAssessment;

export interface PredictResponse {
  riskLevel: "Low" | "Medium" | "High";
  riskProbability: number; // 0-100
  contributingFactors: string[]; // Top 3 factors increasing risk
  protectiveFactors: string[]; // Top 3 factors reducing risk
}

export interface AnalyticsData {
  modelMetrics: {
    accuracy: number;
    f1Score: number;
    rocAuc: number;
    logLoss: number;
    totalSamples: number;
    featuresCount: number;
  };
  coefficients: {
    name: string;
    value: number;
    type: "Risk" | "Protective";
  }[];
  riskDistribution: {
    name: string;
    value: number;
  }[];
}
