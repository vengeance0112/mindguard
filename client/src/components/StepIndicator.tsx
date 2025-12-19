import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <motion.div
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors duration-300",
              i + 1 === currentStep
                ? "bg-primary shadow-[0_0_10px] shadow-primary"
                : i + 1 < currentStep
                ? "bg-primary/50"
                : "bg-white/10"
            )}
            initial={false}
            animate={{
              scale: i + 1 === currentStep ? 1.2 : 1,
            }}
          />
        </div>
      ))}
    </div>
  );
}
