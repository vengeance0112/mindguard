import { z } from 'zod';
import { insertAssessmentSchema, assessments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  predict: {
    method: 'POST' as const,
    path: '/api/predict',
    input: insertAssessmentSchema,
    responses: {
      200: z.object({
        riskLevel: z.enum(["Low", "Medium", "High"]),
        riskProbability: z.number(),
        contributingFactors: z.array(z.string()),
        protectiveFactors: z.array(z.string()),
        // Explainable insights
        insights: z.object({
          breakdown: z.array(z.object({
            feature: z.string(),
            userValue: z.string(),
            impact: z.number(),
            type: z.enum(["Risk", "Protective"]),
            explanation: z.string(),
          })),
          cards: z.array(z.object({
            title: z.string(),
            cause: z.string(),
            effect: z.string(),
            importance: z.string(),
          })),
          improvements: z.array(z.object({
            problem: z.string(),
            why: z.string(),
            action: z.string(),
          })),
          riskComposition: z.array(z.object({
            category: z.string(),
            percentage: z.number(),
            factors: z.array(z.string()),
          })),
          confidence: z.string(),
          confidenceExplanation: z.string(),
        }),
      }),
      400: errorSchemas.validation,
    },
  },
  analytics: {
    method: 'GET' as const,
    path: '/api/analytics',
    responses: {
      200: z.object({
        modelMetrics: z.object({
          accuracy: z.number(),
          f1Score: z.number(),
          rocAuc: z.number(),
          logLoss: z.number(),
          totalSamples: z.number(),
          featuresCount: z.number(),
        }),
        coefficients: z.array(z.object({
          name: z.string(),
          value: z.number(),
          type: z.enum(["Risk", "Protective"]),
        })),
        riskDistribution: z.array(z.object({
          name: z.string(),
          value: z.number(),
        })),
      }),
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
