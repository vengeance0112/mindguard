import { type Assessment, type InsertAssessment } from "@shared/schema";

export interface IStorage {
  // We can log assessments but don't strictly need to persist them for this MVP
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
}

export class MemStorage implements IStorage {
  private assessments: Map<number, Assessment>;
  private currentId: number;

  constructor() {
    this.assessments = new Map();
    this.currentId = 1;
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentId++;
    const assessment: Assessment = { ...insertAssessment, id, riskLevel: null, riskScore: null, timestamp: new Date().toISOString() };
    this.assessments.set(id, assessment);
    return assessment;
  }
}

export const storage = new MemStorage();
