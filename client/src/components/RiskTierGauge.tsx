import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

function getRiskColors(riskLevel: "Low" | "Medium" | "High") {
  if (riskLevel === "High") return { fg: "#ef4444", bg: "rgba(239,68,68,0.18)" };
  if (riskLevel === "Medium") return { fg: "#f97316", bg: "rgba(249,115,22,0.18)" };
  return { fg: "#22c55e", bg: "rgba(34,197,94,0.18)" };
}

export function RiskTierGauge({ value, riskLevel }: { value: number; riskLevel: "Low" | "Medium" | "High" }) {
  const clamped = Math.max(0, Math.min(100, value));
  const colors = getRiskColors(riskLevel);

  const data = [
    { name: "risk", value: clamped },
    { name: "rest", value: 100 - clamped },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative h-32"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="64%"
            outerRadius="82%"
            startAngle={90}
            endAngle={-270}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
            paddingAngle={1}
          >
            <Cell fill={colors.fg} />
            <Cell fill={colors.bg} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-display font-bold text-white">{Math.round(clamped)}</div>
        <div className="text-[11px] text-muted-foreground">risk index</div>
      </div>
    </motion.div>
  );
}
