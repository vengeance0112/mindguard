import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export type ComparisonItem = {
  label: string;
  current: number;
  target: number;
  unit: string;
  max: number;
};

function barWidth(value: number, max: number) {
  const pct = max <= 0 ? 0 : (value / max) * 100;
  return `${Math.max(0, Math.min(100, pct))}%`;
}

export function BeforeAfterMiniComparison({ items }: { items: ComparisonItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <Card className="bg-card border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display">Before vs Improve</CardTitle>
          <UiTooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-white transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px]">
              Quick comparison of your current values vs realistic targets for the top improvements.
            </TooltipContent>
          </UiTooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        {items.map((it) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{it.label}</div>
              <div className="text-xs text-muted-foreground">
                {it.current} {it.unit} → {it.target} {it.unit}
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-white/30" style={{ width: barWidth(it.current, it.max) }} />
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400/70" style={{ width: barWidth(it.target, it.max) }} />
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
