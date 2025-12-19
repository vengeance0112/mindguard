import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface Improvement {
  problem: string;
  why: string;
  action: string;
}

export function ImprovementSuggestions({ improvements }: { improvements: Improvement[] }) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <Card className="bg-card border-white/10 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-display">What You Can Improve Right Now</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">Actionable steps based on your responses</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {improvements.map((imp, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{imp.problem}</p>
                  <p className="text-xs text-muted-foreground mt-1">Why: {imp.why}</p>
                </div>
              </div>
              
              <div className="ml-8 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 font-medium">{imp.action}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
