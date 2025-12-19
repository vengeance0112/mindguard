import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Activity, ShieldCheck, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full max-w-7xl px-6 py-8 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-xl font-display font-bold text-white">MindGuard AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Analytics
          </Link>
          <Link href="/assess">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Take Assessment
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl px-6 py-12 md:py-20 z-10 w-full">
        <motion.div 
          className="text-center max-w-3xl mx-auto space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-primary-foreground/80 backdrop-blur-sm">
            <span className="flex w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            AI-Powered Student Wellbeing Analysis
          </motion.div>

          <motion.h1 
            variants={item}
            className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            Predicting Mental Health <br className="hidden md:block" />
            <span className="text-primary">Before It's Too Late</span>
          </motion.h1>

          <motion.p 
            variants={item}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Our advanced Logistic Regression model analyzes 51 lifestyle and academic features to identify students at risk, enabling timely intervention and support.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/assess">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                Start Risk Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg w-full sm:w-auto">
                View Model Analytics
                <PieChart className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl">
          <StatCard 
            title="Model Accuracy" 
            value="85.1%" 
            icon={Activity} 
            delay={0.4}
            description="Validated on 10k student records"
          />
          <StatCard 
            title="Features Analyzed" 
            value="51" 
            icon={Brain} 
            delay={0.5}
            description="Academic, lifestyle & psychological"
          />
          <StatCard 
            title="Privacy First" 
            value="Secure" 
            icon={ShieldCheck} 
            delay={0.6}
            description="Anonymous assessment processing"
          />
        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t border-white/5 bg-black/20 mt-auto">
        <p>© 2025 MindGuard AI. Built for better student futures.</p>
      </footer>
    </div>
  );
}
