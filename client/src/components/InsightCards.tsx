import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Lightbulb } from "lucide-react";

interface Card {
  title: string;
  cause: string;
  effect: string;
  importance: string;
}

export function InsightCards({ cards }: { cards: Card[] }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-display font-bold">Causal Insights</h3>
      <div className="grid gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="bg-card border-white/10 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <h4 className="text-lg font-semibold text-white">{card.title}</h4>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium mb-1">What's happening:</p>
                  <p className="text-white">{card.cause}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Why it matters:</p>
                  <p className="text-white">{card.effect}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-white text-sm flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {card.importance}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
