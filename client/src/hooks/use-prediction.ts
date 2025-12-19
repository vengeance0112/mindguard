import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type PredictRequest, type PredictResponse, type AnalyticsData } from "@shared/routes";

// POST /api/predict
export function usePredict() {
  return useMutation({
    mutationFn: async (data: PredictRequest) => {
      // Validate with schema on client side first (optional but good practice)
      // const validated = api.predict.input.parse(data); 
      
      const res = await fetch(api.predict.path, {
        method: api.predict.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Try to parse validation error
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Prediction failed");
      }

      return api.predict.responses[200].parse(await res.json());
    },
  });
}

// GET /api/analytics
export function useAnalytics() {
  return useQuery({
    queryKey: [api.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.analytics.responses[200].parse(await res.json());
    },
  });
}
