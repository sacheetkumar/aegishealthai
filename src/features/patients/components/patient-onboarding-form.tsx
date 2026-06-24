"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { savePatientProfile } from "../actions/save-profile";
import { 
  User, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Scale, 
  Ruler, 
  Heart,
  HelpCircle
} from "lucide-react";

interface PatientOnboardingFormProps {
  initialName?: string | null;
}

export function PatientOnboardingForm({ initialName = "" }: PatientOnboardingFormProps) {
  const [name, setName] = useState(initialName || "");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [bloodType, setBloodType] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<{ label: string; color: string; bg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic BMI Calculation
  useEffect(() => {
    const hVal = parseFloat(height);
    const wVal = parseFloat(weight);

    if (hVal > 0 && wVal > 0) {
      const heightInMeters = hVal / 100;
      const calculatedBmi = wVal / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(1)));

      if (calculatedBmi < 18.5) {
        setBmiCategory({ label: "Underweight", color: "text-health-orange", bg: "bg-health-orange/10" });
      } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
        setBmiCategory({ label: "Normal Weight", color: "text-health-green", bg: "bg-health-green/10" });
      } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
        setBmiCategory({ label: "Overweight", color: "text-health-orange", bg: "bg-health-orange/10" });
      } else {
        setBmiCategory({ label: "Obese", color: "text-health-red", bg: "bg-health-red/10" });
      }
    } else {
      setBmi(null);
      setBmiCategory(null);
    }
  }, [height, weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Please enter your full name.");
    if (!age || parseInt(age) <= 0) return toast.error("Please enter a valid age.");
    if (!gender) return toast.error("Please select your gender.");
    if (!bloodType) return toast.error("Please select your blood group.");
    if (!height || parseFloat(height) <= 0) return toast.error("Please enter a valid height.");
    if (!weight || parseFloat(weight) <= 0) return toast.error("Please enter a valid weight.");

    setIsSubmitting(true);
    const toastId = toast.loading("Saving your clinical profile details...");

    try {
      const result = await savePatientProfile({
        name,
        age: parseInt(age),
        gender,
        bloodType,
        height: parseFloat(height),
        weight: parseFloat(weight)
      });

      if (result.success) {
        toast.success("Profile saved successfully! Redirecting to dashboard...", { id: toastId });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        toast.error(result.error || "Failed to save profile details.", { id: toastId });
      }
    } catch {
      toast.error("A network communication error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genders = ["Male", "Female", "Other"];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background/50">
      <Card className="w-full max-w-[620px] shadow-lg border-border/80 overflow-hidden">
        
        {/* Top Accent Gradient Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-health-blue via-violet-500 to-health-green" />
        
        <CardHeader className="pb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-health-blue/10 text-health-blue">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Complete Your Clinical Profile</CardTitle>
              <CardDescription className="text-xs">
                Provide your essential biometric parameters to initialize your clinical chart.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            
            {/* Name & Age Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Full Registry Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs font-semibold focus-visible:outline-none focus:border-health-blue/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Age
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs font-semibold focus-visible:outline-none focus:border-health-blue/40"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Gender Identity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {genders.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      gender === g 
                        ? "bg-health-blue/10 text-health-blue border-health-blue/30 shadow-xs" 
                        : "bg-background text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Group Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Emergency Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodType(bg)}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      bloodType === bg 
                        ? "bg-health-blue/10 text-health-blue border-health-blue/30 shadow-xs" 
                        : "bg-background text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Height & Weight Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Height (cm)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="w-full h-9 pl-3 pr-10 rounded-lg border border-border bg-background/50 text-xs font-semibold focus-visible:outline-none focus:border-health-blue/40"
                  />
                  <span className="absolute right-3 text-[10px] font-bold text-muted-foreground">cm</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Scale className="h-3 w-3" /> Weight (kg)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 72.5"
                    className="w-full h-9 pl-3 pr-10 rounded-lg border border-border bg-background/50 text-xs font-semibold focus-visible:outline-none focus:border-health-blue/40"
                  />
                  <span className="absolute right-3 text-[10px] font-bold text-muted-foreground">kg</span>
                </div>
              </div>
            </div>

            {/* Live BMI Display Card */}
            {bmi !== null && bmiCategory && (
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-health-blue" />
                    Calculated Body Mass Index (BMI)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black tracking-tight text-foreground">{bmi}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bmiCategory.bg} ${bmiCategory.color}`}>
                      {bmiCategory.label}
                    </span>
                  </div>
                </div>
                
                {/* Visual meter pill */}
                <div className="flex-1 max-w-[200px] h-2 bg-muted rounded-full overflow-hidden relative hidden sm:block">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-health-blue via-health-green to-health-red transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, ((bmi - 12) / 28) * 100))}%` }}
                  />
                </div>
              </div>
            )}

          </CardContent>
          
          <CardFooter className="border-t border-border/50 bg-muted/10 p-4 flex justify-between items-center">
            <span className="text-[9px] text-muted-foreground leading-relaxed flex items-start gap-1 max-w-[320px]">
              <HelpCircle className="h-3.5 w-3.5 text-health-orange shrink-0 mt-0.5" />
              This profile data is protected under clinical data privacy guidelines and utilized strictly for diagnostic calibrations.
            </span>
            <Button
              type="submit"
              variant="vital"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="text-xs font-semibold h-9 px-4 cursor-pointer"
            >
              Initialize Profile <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
        
      </Card>
    </div>
  );
}
