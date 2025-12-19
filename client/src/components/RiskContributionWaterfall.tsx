import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, ReferenceLine, LabelList } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type WaterfallItem = { factor: string; impact: number };

function formatImpact(v: number) {
  const sign = v >= 0 ? "+" : "-";
  return `${sign}${Math.abs(v).toFixed(1)} impact`;
}

export function RiskContributionWaterfall({
  waterfall,
  title = "Risk Contribution Waterfall",
}: {
  waterfall?: WaterfallItem[];
  title?: string;
}) {
  const data = (waterfall ?? []).map((d) => ({
    factor: d.factor,
    impact: d.impact,
  }));

  if (!data.length) return null;

  return (
    <Card className="bg-card border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display">{title}</CardTitle>
          <UiTooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-white transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px]">
              Each bar shows how a factor pushes the model's risk score up (red) or down (green).
            </TooltipContent>
          </UiTooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 14, right: 12, bottom: 6, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.22)" />
              <XAxis dataKey="factor" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => formatImpact(Number(value))}
              />
              <Bar dataKey="impact" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="impact" position="top" formatter={(v: any) => formatImpact(Number(v))} />
                {data.map((d, i) => (
                  <Cell key={i} fill={d.impact >= 0 ? "rgba(239,68,68,0.85)" : "rgba(34,197,94,0.85)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
