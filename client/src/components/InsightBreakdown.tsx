import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownItem {
  feature: string;
  userValue: string;
  impact: number;
  type: "Risk" | "Protective";
  explanation: string;
}

export function InsightBreakdown({ breakdown }: { breakdown: BreakdownItem[] }) {
  const chartData = breakdown.map(item => ({
    name: item.feature.length > 15 ? item.feature.substring(0, 15) + "..." : item.feature,
    value: item.type === "Risk" ? item.impact : -item.impact,
    fullName: item.feature,
    impact: item.impact,
    type: item.type,
    userValue: item.userValue,
    explanation: item.explanation
  }));

  return (
    <Card className="bg-card border-white/10 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-display">Why You Got This Result</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">Detailed breakdown of factors influencing your risk score</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
              formatter={(value: any) => `${Math.abs(value)} impact`}
              labelFormatter={(label: any) => {
                const item = breakdown.find(b => 
                  (b.feature.length > 15 ? b.feature.substring(0, 15) + "..." : b.feature) === label || 
                  b.feature === label
                );
                return item ? item.feature : label;
              }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          {breakdown.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white">{item.feature}</p>
                  <p className="text-xs text-muted-foreground">Your value: {item.userValue}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.type === "Risk" 
                    ? "bg-red-500/20 text-red-300"
                    : "bg-green-500/20 text-green-300"
                }`}>
                  {item.type === "Risk" ? "+": "-"}{item.impact} impact
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.explanation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
