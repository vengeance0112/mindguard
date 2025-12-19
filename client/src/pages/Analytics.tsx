import { useAnalytics } from "@/hooks/use-prediction";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Brain, Activity, BarChart3 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
        <h2 className="text-xl font-bold text-destructive mb-2">Failed to load analytics</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  // Fallback if data is missing
  if (!data) return null;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-sm text-primary">
            Coefficient: {Number(payload[0].value).toFixed(3)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {payload[0].payload.type} Factor
          </p>
        </div>
      );
    }
    return null;
  };

  // Sort coefficients by absolute value to show most impactful features
  const sortedCoeffs = [...data.coefficients]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 15);

  const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444']; // Low, Med, High

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-display font-bold text-white">Model Analytics</h1>
            <p className="text-muted-foreground">Performance metrics and feature importance analysis</p>
          </div>
          <Link href="/assess">
            <Button>Take Assessment</Button>
          </Link>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{(data.modelMetrics.accuracy * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">F1 Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{(data.modelMetrics.f1Score * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROC AUC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.modelMetrics.rocAuc.toFixed(3)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dataset Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{data.modelMetrics.totalSamples.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feature Importance */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Contributing Factors
              </CardTitle>
              <CardDescription>
                Features with the highest impact on risk prediction. 
                <span className="text-red-400 ml-1">Red = Increases Risk</span>, 
                <span className="text-green-400 ml-1">Green = Reduces Risk</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedCoeffs} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    width={100}
                    tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {sortedCoeffs.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value > 0 ? '#ef4444' : '#22c55e'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Risk Distribution
              </CardTitle>
              <CardDescription>
                Population breakdown by risk level
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="flex justify-center gap-6 pb-6">
              {data.riskDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
