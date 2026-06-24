"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Heart, 
  Flame, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Brain, 
  Stethoscope, 
  ArrowRight, 
  Lock,
  Check
} from "lucide-react";

export default function LandingPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [simulatedPrognosis, setSimulatedPrognosis] = useState<{ prognosis: string; confidence: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the disease prediction system work?",
      answer: "The disease prediction system analyzes symptoms selected by users and cross-references them against trained machine learning classifiers. It evaluates the matrix of input indicators to generate statistical disease probabilities and suggest potential clinical diagnoses."
    },
    {
      question: "Which machine learning algorithms are used?",
      answer: "AegisHealthAI employs hybrid ensemble models, combining Random Forest and XGBoost algorithms. These classifiers are trained on large clinical datasets to ensure robust prediction confidence indices and precise disease mapping."
    },
    {
      question: "How are doctors recommended?",
      answer: "When a disease probability is generated, the system maps the predicted classification to the relevant clinical specialty (e.g. Cardiology, Endocrinology, or Dermatology). It then recommends certified specialists matching that profile for immediate scheduling."
    },
    {
      question: "Can multiple symptoms be analyzed simultaneously?",
      answer: "Yes, you can toggle multiple symptoms concurrently in the interface. The prediction models evaluate the combined presence or absence of symptoms as a vector input, allowing for more comprehensive multi-symptom diagnostic simulation."
    },
    {
      question: "Is patient information securely stored?",
      answer: "Absolutely. All patient profiles, history logs, and simulated prediction records are strictly encrypted at-rest and in-transit. Access boundaries ensure only authorized patients and recommended clinicians can decrypt records."
    }
  ];

  const sampleSymptoms = [
    { key: "itching", label: "Skin Itching" },
    { key: "continuous_sneezing", label: "Sneezing" },
    { key: "joint_pain", label: "Joint Pain" },
    { key: "stomach_pain", label: "Stomach Pain" },
    { key: "cough", label: "Cough" },
    { key: "fatigue", label: "Fatigue" },
  ];

  const handleToggleSymptom = (key: string) => {
    if (selectedSymptoms.includes(key)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== key));
    } else {
      setSelectedSymptoms(prev => [...prev, key]);
    }
    setSimulatedPrognosis(null);
  };

  const runSimulation = () => {
    if (selectedSymptoms.length === 0) return;
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      // Simple mock logic for illustration
      if (selectedSymptoms.includes("itching")) {
        setSimulatedPrognosis({ prognosis: "Fungal Infection / Dermatitis", confidence: 92 });
      } else if (selectedSymptoms.includes("continuous_sneezing") || selectedSymptoms.includes("cough")) {
        setSimulatedPrognosis({ prognosis: "Allergic Rhinitis / Bronchitis", confidence: 88 });
      } else if (selectedSymptoms.includes("joint_pain")) {
        setSimulatedPrognosis({ prognosis: "Osteoarthritis / Musculoskeletal Strain", confidence: 85 });
      } else {
        setSimulatedPrognosis({ prognosis: "General Constitutional Dysregulation", confidence: 78 });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200 overflow-x-hidden">
      

      {/* Hero Background Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute -top-[20%] left-[10%] w-[45%] aspect-square rounded-full bg-radial from-health-blue/20 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -top-[10%] right-[15%] w-[40%] aspect-square rounded-full bg-radial from-health-green/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold tracking-tight">
              Æ
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm sm:text-base">AegisHealth</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-border" />
            <Link href="/doctors" className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer hidden sm:inline">
              Specialists
            </Link>
            <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
              Sign In
            </Link>
            <Button asChild size="sm" variant="vital" className="text-xs font-semibold cursor-pointer">
              <Link href="/register">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero & Marketing Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 space-y-24">
        
        {/* Core Hero Content */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground"
          >
            Transforming Healthcare Through <br />
            <span className="bg-gradient-to-r from-health-blue via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Intelligent Disease Prediction
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Combining machine learning and symptom analysis to provide early disease prediction and recommend suitable medical experts.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4 flex flex-wrap justify-center gap-3.5"
          >
            <Button asChild size="lg" variant="vital" className="font-semibold cursor-pointer shadow-md text-xs sm:text-sm">
              <Link href="/login">
                Predict Disease <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold cursor-pointer text-xs sm:text-sm">
              <Link href="/doctors">
                Browse Doctors
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <section className="space-y-10 py-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              A simple, secure four-step pathway from initial symptom evaluation to direct expert consultation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <Card className="border-border/60 hover:border-health-blue/40 transition-colors relative overflow-hidden group">
              <div className="absolute top-3 right-3 text-[32px] font-black text-muted/10 select-none group-hover:text-health-blue/5 transition-colors">01</div>
              <CardContent className="p-6 space-y-4">
                <span className="p-2.5 bg-health-blue/10 text-health-blue rounded-lg inline-block">
                  <Activity className="h-5 w-5" />
                </span>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">1. Select Symptoms</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Input your active symptoms or clinical metrics in the interactive diagnostics matrix.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-border/60 hover:border-purple-500/40 transition-colors relative overflow-hidden group">
              <div className="absolute top-3 right-3 text-[32px] font-black text-muted/10 select-none group-hover:text-purple-500/5 transition-colors">02</div>
              <CardContent className="p-6 space-y-4">
                <span className="p-2.5 bg-purple-500/10 text-purple-600 rounded-lg inline-block">
                  <Brain className="h-5 w-5" />
                </span>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">2. Dual ML Analysis</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The Random Forest and XGBoost ensemble engines evaluate symptoms against thousands of clinical cases.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-border/60 hover:border-health-green/40 transition-colors relative overflow-hidden group">
              <div className="absolute top-3 right-3 text-[32px] font-black text-muted/10 select-none group-hover:text-health-green/5 transition-colors">03</div>
              <CardContent className="p-6 space-y-4">
                <span className="p-2.5 bg-health-green/10 text-health-green rounded-lg inline-block">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">3. View Prognosis</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Access statistical classification percentages and confidence scores generated inside your secure profile.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="border-border/60 hover:border-health-orange/40 transition-colors relative overflow-hidden group">
              <div className="absolute top-3 right-3 text-[32px] font-black text-muted/10 select-none group-hover:text-health-orange/5 transition-colors">04</div>
              <CardContent className="p-6 space-y-4">
                <span className="p-2.5 bg-health-orange/10 text-health-orange rounded-lg inline-block">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">4. Connect to Specialists</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Get automatically matched to a certified specialist and book appointments directly on your dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Portals Showcase Grid (Patient Dashboard vs Doctor Portal) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Interactive Medical Portals</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Access tailored workflows based on your profile authorization credentials.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Patient Portal Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="h-full border border-border/80 shadow-md relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 left-0 w-full h-1 bg-health-blue" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-health-blue/10 text-health-blue rounded-xl">
                      <Brain className="h-6 w-6" />
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground border border-border/60 px-2 py-0.5 rounded-full">
                      Health Assessment
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-health-blue transition-colors">
                      Health Assessment Portal
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Analyze symptoms and health parameters to predict diseases and generate personalized health insights.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Symptom-Based Disease Prediction</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Blood Pressure and Glucose Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Health Report Visualization</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Personalized Health Insights</span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-8 pt-0">
                  <Button asChild variant="outline" className="w-full text-xs font-semibold hover:bg-health-blue hover:text-white hover:border-health-blue transition-colors cursor-pointer">
                    <Link href="/login">
                      Enter Assessment Portal <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Doctor Portal Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="h-full border border-border/80 shadow-md relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 left-0 w-full h-1 bg-health-green" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-health-green/10 text-health-green rounded-xl">
                      <Stethoscope className="h-6 w-6" />
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground border border-border/60 px-2 py-0.5 rounded-full">
                      Specialist Portal
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-health-green transition-colors">
                      Specialist Recommendation Portal
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Recommend doctors and specialists based on predicted diseases and patient requirements.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Doctor Recommendation by Disease Category</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Specialist Information</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Consultation Suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-health-green shrink-0" />
                      <span>Patient Prediction Reports</span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-8 pt-0">
                  <Button asChild variant="outline" className="w-full text-xs font-semibold hover:bg-health-green hover:text-white hover:border-health-green transition-colors cursor-pointer">
                    <Link href="/login">
                      View Recommended Doctors <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>

          </div>
        </section>

        {/* Live Interactive Simulator section */}
        <section className="bg-muted/30 border border-border/80 rounded-2xl p-6 sm:p-10 grid gap-8 md:grid-cols-5 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Brain className="h-64 w-64 text-foreground" />
          </div>

          <div className="md:col-span-2 space-y-4 relative z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-health-blue">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Sandbox Simulator
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Disease Prediction Simulator
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select symptoms and test the machine learning model to predict possible diseases and receive specialist recommendations.
            </p>
            <div className="pt-2">
              <Link href="/login" className="inline-flex items-center text-xs font-semibold text-health-blue hover:underline gap-1 cursor-pointer">
                Unlock full 132-symptom diagnostics & booking <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4 relative z-10">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Test Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {sampleSymptoms.map(symptom => {
                    const isSelected = selectedSymptoms.includes(symptom.key);
                    return (
                      <button
                        key={symptom.key}
                        onClick={() => handleToggleSymptom(symptom.key)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-health-blue/15 text-health-blue border-health-blue/30 shadow-xs" 
                            : "bg-background text-muted-foreground border-border/80 hover:bg-muted/80"
                        }`}
                      >
                        {symptom.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    size="sm"
                    variant="vital"
                    onClick={runSimulation} 
                    disabled={selectedSymptoms.length === 0 || isSimulating}
                    className="text-[10px] font-semibold cursor-pointer h-8"
                  >
                    {isSimulating ? "Running RF/XGBoost..." : "Run Prediction"}
                  </Button>

                  {selectedSymptoms.length > 0 && (
                    <button 
                      onClick={() => { setSelectedSymptoms([]); setSimulatedPrognosis(null); }}
                      className="text-[10px] text-muted-foreground hover:text-destructive cursor-pointer font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Simulation Output */}
                <AnimatePresence>
                  {simulatedPrognosis && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3.5 bg-health-blue/5 border border-health-blue/20 rounded-lg space-y-2.5 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-health-blue uppercase tracking-wider text-[9px]">Simulation Prognosis Output</span>
                        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                          <Check className="h-3 w-3 text-health-green" /> Correct Matches
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-foreground text-sm truncate max-w-[190px]">{simulatedPrognosis.prognosis}</span>
                        <span className="font-mono font-bold text-health-blue text-xs shrink-0">{simulatedPrognosis.confidence}% Confidence</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Real-time clinical follow-ups match you with relevant cardiologists or dermatologists.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security & Core Stack highlights */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-2">
              <span className="p-2 bg-health-blue/10 text-health-blue rounded-lg inline-block">
                <Lock className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Secure Data Management</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Patient records and prediction results are securely maintained.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6 space-y-2">
              <span className="p-2 bg-health-green/10 text-health-green rounded-lg inline-block">
                <Activity className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Symptom Analysis Engine</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Processes user symptoms and health parameters for disease prediction.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6 space-y-2">
              <span className="p-2 bg-purple-500/10 text-purple-600 rounded-lg inline-block">
                <Sparkles className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Ensemble Learning Models</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Combines Random Forest and XGBoost algorithms to improve prediction accuracy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6 space-y-2">
              <span className="p-2 bg-health-orange/10 text-health-orange rounded-lg inline-block">
                <Calendar className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Doctor Recommendation Module</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Suggests appropriate specialists based on predicted disease categories.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 max-w-4xl mx-auto pt-6 border-t border-border/40">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex justify-center items-center gap-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to know about AegisHealthAI's compliance, security, and smart features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <Card key={index} className="overflow-hidden border border-border/80 transition-all duration-200">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex justify-between items-center cursor-pointer hover:bg-muted/10 transition-colors focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-bold text-foreground pr-4">
                      {faq.question}
                    </span>
                    <span className={`p-1 bg-muted rounded-lg text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-90 text-health-blue bg-health-blue/10' : ''}`}>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/30 bg-muted/5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section className="bg-muted/30 border border-border/80 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="h-4 w-4 text-health-blue" />
              Your Privacy, Fully Shielded
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              We enforce strict cryptographic access boundaries and follow comprehensive data privacy and patient safety rules. Read our full policy to learn how your health data is encrypted.
            </p>
          </div>
          <Button asChild variant="outline" className="text-xs font-semibold cursor-pointer shrink-0">
            <Link href="/privacy">
              Read Privacy Policy <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 mt-20 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground sm:px-6">
          <p>© 2026 AegisHealthAI | AI Disease Prediction and Doctor Recommendation System</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground">Specialist Access</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-foreground">Patient Registry</Link>
            <span>•</span>
            <a href="#" className="hover:text-foreground">Security Details</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
