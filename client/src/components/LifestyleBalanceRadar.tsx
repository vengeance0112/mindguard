import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Inputs = {
  sleepHours: number;
  screenTime: number;
  outdoorActivity: number;
  stressLevel: number;
  academicPressure: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function toScore({ sleepHours, screenTime, outdoorActivity, stressLevel, academicPressure }: Inputs) {
  const sleep = clamp01(sleepHours / 9) * 100;
  const outdoor = clamp01(outdoorActivity / 5) * 100;
  const screen = (1 - clamp01(screenTime / 12)) * 100;
  const stress = (1 - clamp01((stressLevel - 1) / 4)) * 100;
  const pressure = (1 - clamp01((academicPressure - 1) / 4)) * 100;

  return {
    sleep,
    screen,
    outdoor,
    stress,
    pressure,
  };
}

export function LifestyleBalanceRadar({
  inputs,
  ideal,
}: {
  inputs: Inputs;
  ideal: Inputs;
}) {
  const user = toScore(inputs);
  const base = toScore(ideal);

  const data = [
    { metric: "Sleep", user: user.sleep, ideal: base.sleep },
    { metric: "Screen Time", user: user.screen, ideal: base.screen },
    { metric: "Outdoor Activity", user: user.outdoor, ideal: base.outdoor },
    { metric: "Stress Level", user: user.stress, ideal: base.stress },
    { metric: "Academic Pressure", user: user.pressure, ideal: base.pressure },
  ];

  return (
    <Card className="bg-card border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display">Lifestyle Balance Radar</CardTitle>
          <UiTooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-white transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              This chart compares your current lifestyle balance (blue) vs a healthy baseline (white). Higher is better.
            </TooltipContent>
          </UiTooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data} outerRadius="78%">
              <PolarGrid stroke="rgba(255,255,255,0.10)" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => `${Math.round(Number(value))}/100`}
              />
              <Radar name="Ideal" dataKey="ideal" stroke="rgba(255,255,255,0.65)" fill="rgba(255,255,255,0.14)" />
              <Radar name="You" dataKey="user" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.22} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
