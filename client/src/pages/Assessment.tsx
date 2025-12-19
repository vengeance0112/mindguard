import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { usePredict } from "@/hooks/use-prediction";
import { insertAssessmentSchema, type InsertAssessment } from "@shared/schema";
import { Link } from "wouter";

// Icons
import { ArrowLeft, ArrowRight, Brain, Loader2, AlertTriangle, CheckCircle, Heart } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { StepIndicator } from "@/components/StepIndicator";

// Define form fields for each step
const STEPS = [
  {
    id: "lifestyle",
    title: "Lifestyle & Habits",
    description: "Tell us about your daily routine"
  },
  {
    id: "personal",
    title: "Personal Profile",
    description: "Basic demographic information"
  },
  {
    id: "psychology",
    title: "Wellbeing Check",
    description: "How are you feeling lately?"
  }
];

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<any>(null);

  const form = useForm<InsertAssessment>({
    resolver: zodResolver(insertAssessmentSchema),
    defaultValues: {
      age: 20,
      studyHours: 5,
      sleepHours: 7,
      screenTime: 4,
      outdoorActivity: 1,
      gender: "Male",
      academicLevel: "Undergraduate",
      talkTo: "Friends",
      openness: "Maybe",
      academicPressure: 3,
      stressLevel: 3,
      sleepIssues: 1,
      hopelessness: 1,
      financialComfort: 3,
      institutionalSupport: 3,
    }
  });

  const { mutate: predict, isPending } = usePredict();

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(0, s - 1));
  };

  const onSubmit = (data: InsertAssessment) => {
    predict(data, {
      onSuccess: (res) => {
        setResult(res);
      },
      onError: (err) => {
        console.error(err);
      }
    });
  };

  // Render Result View if we have a result
  if (result) {
    const isHighRisk = result.riskLevel === "High";
    const isMedRisk = result.riskLevel === "Medium";
    
    let riskColor = "text-green-500";
    let riskBg = "bg-green-500/10 border-green-500/20";
    let RiskIcon = CheckCircle;

    if (isHighRisk) {
      riskColor = "text-red-500";
      riskBg = "bg-red-500/10 border-red-500/20";
      RiskIcon = AlertTriangle;
    } else if (isMedRisk) {
      riskColor = "text-orange-500";
      riskBg = "bg-orange-500/10 border-orange-500/20";
      RiskIcon = AlertTriangle;
    }

    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl space-y-8"
        >
          <div className="text-center space-y-2">
             <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-display font-bold">Assessment Result</h1>
            <p className="text-muted-foreground">Based on our analysis of your responses</p>
          </div>

          <Card className={`overflow-hidden border-2 ${riskBg}`}>
            <CardContent className="p-8 text-center space-y-6">
              <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${riskBg} border-2`}>
                <RiskIcon className={`w-12 h-12 ${riskColor}`} />
              </div>
              
              <div>
                <h2 className="text-xl font-medium text-muted-foreground mb-1">Estimated Risk Level</h2>
                <div className={`text-5xl font-display font-bold ${riskColor}`}>{result.riskLevel}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Confidence Score: {(result.riskProbability * 100).toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Key Contributing Factors</h4>
                  <ul className="space-y-2">
                    {result.contributingFactors.map((factor: string, i: number) => (
                      <li key={i} className="text-sm text-red-400 flex items-start">
                        <span className="mr-2">•</span> {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Protective Factors</h4>
                  <ul className="space-y-2">
                    {result.protectiveFactors.map((factor: string, i: number) => (
                      <li key={i} className="text-sm text-green-400 flex items-start">
                        <span className="mr-2">•</span> {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Panel - CRITICAL REQUIREMENT */}
          <Card className="bg-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Support & Resources</h3>
                  <p className="text-sm text-muted-foreground">You are not alone. Help is available 24/7.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="font-semibold text-white">Kiran National Helpline</div>
                    <div className="text-sm text-muted-foreground">Mental Health Rehabilitation</div>
                  </div>
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                    Call 1800-599-0019
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-semibold text-white text-sm">Student Wellness Center</div>
                    <div className="text-xs text-muted-foreground mt-1">On-campus counseling services available Mon-Fri, 9am-5pm.</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-semibold text-white text-sm">Online Therapy</div>
                    <div className="text-xs text-muted-foreground mt-1">Connect with licensed therapists through our partner network.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => { setResult(null); setStep(0); }}>
              Start New Assessment
            </Button>
            <Link href="/analytics">
              <Button>View Global Analytics</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // WIZARD FORM
  return (
    <div className="min-h-screen bg-background py-12 px-4 flex flex-col items-center">
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white transition-colors flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Link>

      <div className="w-full max-w-2xl mb-8 text-center space-y-2">
        <h1 className="text-3xl font-display font-bold">Risk Assessment</h1>
        <p className="text-muted-foreground">Step {step + 1} of 3: {STEPS[step].description}</p>
      </div>

      <StepIndicator currentStep={step + 1} totalSteps={3} />

      <Card className="w-full max-w-2xl glass-card overflow-hidden">
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8 min-h-[400px]"
            >
              {/* STEP 1: LIFESTYLE */}
              {step === 0 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Age</Label>
                      <span className="text-sm text-primary font-mono">{form.watch("age")} years</span>
                    </div>
                    <Slider 
                      value={[form.watch("age")]} 
                      onValueChange={([v]) => form.setValue("age", v)} 
                      min={16} max={35} step={1} 
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Study Hours (Daily)</Label>
                      <span className="text-sm text-primary font-mono">{form.watch("studyHours")} hrs</span>
                    </div>
                    <Slider 
                      value={[form.watch("studyHours")]} 
                      onValueChange={([v]) => form.setValue("studyHours", v)} 
                      min={0} max={16} step={1} 
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Sleep Hours (Daily)</Label>
                      <span className="text-sm text-primary font-mono">{form.watch("sleepHours")} hrs</span>
                    </div>
                    <Slider 
                      value={[form.watch("sleepHours")]} 
                      onValueChange={([v]) => form.setValue("sleepHours", v)} 
                      min={0} max={12} step={1} 
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Screen Time (Daily)</Label>
                      <span className="text-sm text-primary font-mono">{form.watch("screenTime")} hrs</span>
                    </div>
                    <Slider 
                      value={[form.watch("screenTime")]} 
                      onValueChange={([v]) => form.setValue("screenTime", v)} 
                      min={0} max={16} step={1} 
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: PERSONAL */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label>Gender</Label>
                    <RadioGroup 
                      onValueChange={(v) => form.setValue("gender", v)} 
                      defaultValue={form.watch("gender")}
                      className="grid grid-cols-3 gap-4"
                    >
                      {["Male", "Female", "Other"].map((opt) => (
                        <div key={opt}>
                          <RadioGroupItem value={opt} id={`g-${opt}`} className="peer sr-only" />
                          <Label
                            htmlFor={`g-${opt}`}
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Academic Level</Label>
                    <RadioGroup 
                      onValueChange={(v) => form.setValue("academicLevel", v)} 
                      defaultValue={form.watch("academicLevel")}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {["High School", "Undergraduate", "Postgraduate"].map((opt) => (
                        <div key={opt}>
                          <RadioGroupItem value={opt} id={`a-${opt}`} className="peer sr-only" />
                          <Label
                            htmlFor={`a-${opt}`}
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all text-center h-full"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Who do you usually talk to about problems?</Label>
                     <RadioGroup 
                      onValueChange={(v) => form.setValue("talkTo", v)} 
                      defaultValue={form.watch("talkTo")}
                      className="grid grid-cols-2 gap-4"
                    >
                      {["Family", "Friends", "Counselor", "None"].map((opt) => (
                        <div key={opt}>
                          <RadioGroupItem value={opt} id={`t-${opt}`} className="peer sr-only" />
                          <Label
                            htmlFor={`t-${opt}`}
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* STEP 3: PSYCHOLOGY */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground mb-4">Rate the following on a scale of 1 (Low) to 5 (High)</p>
                  
                  {[
                    { key: "academicPressure", label: "Academic Pressure" },
                    { key: "stressLevel", label: "Stress Level" },
                    { key: "hopelessness", label: "Feelings of Hopelessness" },
                    { key: "financialComfort", label: "Financial Comfort" },
                    { key: "institutionalSupport", label: "Support from Institution" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>{field.label}</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {form.watch(field.key as any)}/5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const currentVal = form.watch(field.key as any);
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => form.setValue(field.key as any, val)}
                              className={`flex-1 h-10 rounded-lg transition-all border ${
                                currentVal === val 
                                  ? "bg-primary text-white border-primary shadow-[0_0_10px] shadow-primary/30" 
                                  : "bg-background border-input hover:bg-accent"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          <div className="p-6 border-t border-white/5 flex justify-between bg-black/20">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={step === 0 || isPending}
            >
              Back
            </Button>
            
            <Button 
              onClick={nextStep} 
              disabled={isPending}
              className="w-32"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === STEPS.length - 1 ? (
                "Analyze Risk"
              ) : (
                <>Next <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
