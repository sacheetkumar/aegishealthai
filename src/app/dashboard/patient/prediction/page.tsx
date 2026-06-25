"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Brain, 
  Sparkles, 
  Check, 
  X, 
  ShieldAlert,
  Loader2,
  TrendingUp,
  Star,
  Award,
  UserCheck,
  HeartHandshake,
  MapPin,
  Phone,
  Activity,
  Stethoscope
} from "lucide-react";
import { getDoctorRecommendations, type RecommendedDoctor } from "@/features/doctors/actions/recommend-doctors";
import { bookAppointmentAction } from "@/features/doctors/actions/book-appointment";

// Pre-define symptom category groupings for clean UX rather than a raw list of 132 items
const SYMPTOM_CATEGORIES: { [key: string]: string[] } = {
  "General / Constitutional": [
    "fatigue", "chills", "shivering", "high_fever", "mild_fever", "sweating", "dehydration", "malaise", "weight_gain", "weight_loss", "restlessness", "lethargy", "obesity"
  ],
  "Pain & Discomfort": [
    "headache", "chest_pain", "stomach_pain", "abdominal_pain", "belly_pain", "joint_pain", "muscle_pain", "back_pain", "neck_pain", "cramps", "painful_walking", "throat_pain"
  ],
  "Skin & Nails": [
    "itching", "skin_rash", "nodal_skin_eruptions", "dischromic_patches", "red_spots_over_body", "pus_filled_pimples", "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails", "blister", "red_sore_around_nose", "yellow_crust_ooze", "scabs", "drying_of_peels_and_cutis"
  ],
  "Digestive & GI": [
    "acidity", "indigestion", "vomiting", "nausea", "loss_of_appetite", "constipation", "diarrhoea", "ulcers_on_tongue", "swelling_of_stomach", "stomach_bleeding", "distention_of_abdomen", "passage_of_gases", "increased_appetite"
  ],
  "Respiratory & ENT": [
    "continuous_sneezing", "cough", "breathlessness", "runny_nose", "congestion", "sinus_pressure", "throat_irritation", "phlegm", "mucoid_sputum", "rusty_sputum", "blood_in_sputum", "loss_of_smell"
  ],
  "Neurological & Mood": [
    "dizziness", "altered_sensorium", "coma", "spinning_movements", "loss_of_balance", "unsteadiness", "weakness_of_one_body_side", "lack_of_concentration", "visual_disturbances", "depression", "irritability", "anxiety", "mood_swings"
  ],
  "Others / Specific": [
    "yellowish_skin", "yellowing_of_eyes", "dark_urine", "acute_liver_failure", "receiving_blood_transfusion", "receiving_unsterile_injections", "history_of_alcohol_consumption", "palpitations", "polyuria", "family_history", "extra_marital_contacts", "muscle_wasting", "patches_in_throat", "irregular_sugar_level"
  ]
};

// Flatten helper to format symptom keys to labels (e.g. "skin_rash" -> "Skin Rash")
const formatSymptomLabel = (s: string) => {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bGi\b/i, "GI");
};

interface ModelPrediction {
  prognosis: string;
  confidence: number;
}

interface PredictionResult {
  random_forest: ModelPrediction;
  xgboost: ModelPrediction;
}

export default function PredictionPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomsText, setSymptomsText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [aiResults, setAiResults] = useState<any | null>(null);
  
  // Follow-up state
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [followUpHistory, setFollowUpHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedDoctor[] | null>(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<RecommendedDoctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingReason, setBookingReason] = useState("AI clinical diagnostics follow-up");
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  // Directions state
  const [directionsDoctor, setDirectionsDoctor] = useState<RecommendedDoctor | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirectionsForHospital = (hospitalAddress: string) => {
    if (hospitalAddress.includes("Max Super Speciality Hospital") && hospitalAddress.includes("Saket")) {
      return [
        { step: "Start from New Delhi Metro Station Gate 2.", dist: "0.0 km" },
        { step: "Head south on Outer Ring Road toward Press Enclave Marg.", dist: "8.2 km" },
        { step: "Turn left onto Press Enclave Marg at Saket District Court.", dist: "1.5 km" },
        { step: "Take the second exit at the roundabout toward Mandir Marg.", dist: "450 m" },
        { step: "Turn right. Max Super Speciality Hospital will be on your left.", dist: "100 m" }
      ];
    }
    if (hospitalAddress.includes("Fortis Memorial") && hospitalAddress.includes("Gurugram")) {
      return [
        { step: "Start from Huda City Centre Metro Station.", dist: "0.0 km" },
        { step: "Head East on sector road toward FMRI bypass.", dist: "200 m" },
        { step: "Turn left at the traffic signal onto FMRI Road.", dist: "350 m" },
        { step: "Make a U-turn near Sector 44 exit.", dist: "100 m" },
        { step: "Arrive at Fortis Memorial Research Institute on your left.", dist: "50 m" }
      ];
    }
    if (hospitalAddress.includes("Kokilaben") && hospitalAddress.includes("Andheri")) {
      return [
        { step: "Start from Andheri West Railway Station.", dist: "0.0 km" },
        { step: "Head west on S V Road toward JP Road.", dist: "1.2 km" },
        { step: "Turn right onto JP Road at Metro Station.", dist: "2.1 km" },
        { step: "Turn left onto Achutrao Patwardhan Marg.", dist: "800 m" },
        { step: "Arrive at Kokilaben Dhirubhai Ambani Hospital.", dist: "100 m" }
      ];
    }
    if (hospitalAddress.includes("Manipal Hospital") && hospitalAddress.includes("HAL")) {
      return [
        { step: "Start from Indira Nagar Metro Station.", dist: "0.0 km" },
        { step: "Head South on 100 Feet Road toward Old Airport Road.", dist: "3.2 km" },
        { step: "Turn left onto HAL Old Airport Road at the junction.", dist: "1.1 km" },
        { step: "Make a U-turn at Kodihalli signal.", dist: "200 m" },
        { step: "Manipal Hospital Bangalore will be on your left.", dist: "150 m" }
      ];
    }
    if (hospitalAddress.includes("Apollo Hospitals") && hospitalAddress.includes("Jubilee Hills")) {
      return [
        { step: "Start from Jubilee Hills Check Post Metro Station.", dist: "0.0 km" },
        { step: "Head West on Road No. 36 toward Jubilee Hills Road No. 92.", dist: "600 m" },
        { step: "Turn left onto Road No. 92 at Apollo Junction.", dist: "1.4 km" },
        { step: "Keep right to stay on Apollo Hospital Road.", dist: "300 m" },
        { step: "Arrive at Apollo Hospitals Jubilee Hills.", dist: "100 m" }
      ];
    }
    return [
      { step: "Start from nearest transit station or city hub.", dist: "0.0 km" },
      { step: "Head toward the primary arterial bypass highway.", dist: "2.5 km" },
      { step: "Merge onto the service road following signs for clinic sector.", dist: "1.2 km" },
      { step: "Turn onto the local clinic accessibility bypass lane.", dist: "600 m" },
      { step: "Arrive at doctor's clinic. Parking is available at entrance.", dist: "100 m" }
    ];
  };

  // Fetch full symptoms catalog on mount to verify server connection
  useEffect(() => {
    async function loadSymptoms() {
      try {
        const response = await fetch("/api/predict");
        if (!response.ok) throw new Error("Could not contact prediction API.");
      } catch (error) {
        console.error(error);
        toast.error("Failed to connect to AI clinical diagnostics server.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSymptoms();
  }, []);

  const handleToggleSymptom = (s: string) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(prev => prev.filter(item => item !== s));
    } else {
      setSelectedSymptoms(prev => [...prev, s]);
    }
  };

  const handleClearSelected = () => {
    setSelectedSymptoms([]);
    setSymptomsText("");
    setResults(null);
    setAiResults(null);
    setFollowUpQuestion(null);
    setFollowUpHistory([]);
    setFollowUpAnswer("");
    setRecommendations(null);
    setDirectionsDoctor(null);
    setShowDirections(false);
    setError(null);
  };

  const fetchDoctorRecommendations = async (disease: string) => {
    setIsFetchingRecs(true);
    setRecommendations(null);
    try {
      const recs = await getDoctorRecommendations(disease);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch specialist recommendations.");
    } finally {
      setIsFetchingRecs(false);
    }
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0 && !symptomsText.trim()) {
      toast.error("Please enter a symptom description or check at least one symptom tag.");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setAiResults(null);
    setFollowUpQuestion(null);
    setFollowUpHistory([]);
    setRecommendations(null);
    setError(null);

    // Sequence mock loader logs for premium Linear/Stripe style real-time UX
    const steps = [
      "Contacting secure AegisHealth AI gateway...",
      "Generating semantic embeddings of symptoms...",
      "Searching clinical knowledge vector database...",
      "Retrieving clinical case context...",
      "Running AI diagnostic engine...",
      "Evaluating severity levels & emergency warnings...",
      "Logging diagnostic event in PostgreSQL..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          symptomsText: symptomsText,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.follow_up_required) {
          setFollowUpQuestion(data.follow_up_question);
          setFollowUpHistory([{ role: "assistant", content: data.follow_up_question }]);
          toast.info("AI requests additional symptom details.");
        } else {
          setResults(data.predictions);
          setAiResults(data.aiResults);
          toast.success("Diagnostics completed successfully!");
          
          const primaryDisease = data.aiResults?.predictions?.[0]?.disease;
          if (primaryDisease) {
            await fetchDoctorRecommendations(primaryDisease);
          }
        }
      } else {
        const errorMsg = "failed due to poor internet connection, check your connection again";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "failed due to poor internet connection, check your connection again";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAnswer.trim()) return;

    setIsFollowUpLoading(true);
    const answer = followUpAnswer;
    setFollowUpAnswer("");
    setError(null);

    const updatedHistory = [
      ...followUpHistory,
      { role: "user" as const, content: answer }
    ];
    setFollowUpHistory(updatedHistory);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          symptomsText: `${symptomsText}\nFollow-up: ${answer}`,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.follow_up_required) {
          setFollowUpQuestion(data.follow_up_question);
          setFollowUpHistory(prev => [...prev, { role: "assistant" as const, content: data.follow_up_question }]);
          toast.info("AI requests additional symptom details.");
        } else {
          setResults(data.predictions);
          setAiResults(data.aiResults);
          setFollowUpQuestion(null);
          toast.success("Diagnostics completed successfully!");
          
          const primaryDisease = data.aiResults?.predictions?.[0]?.disease;
          if (primaryDisease) {
            await fetchDoctorRecommendations(primaryDisease);
          }
        }
      } else {
        const errorMsg = "failed due to poor internet connection, check your connection again";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "failed due to poor internet connection, check your connection again";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error("Please select a timeslot first.");
      return;
    }

    const slot = selectedDoctor.availabilities.find(a => a.id === selectedSlot);
    if (!slot) return;

    setIsBooking(true);
    try {
      // Calculate appointment date: next upcoming slot.dayOfWeek
      const today = new Date();
      const currentDay = today.getDay(); // 0 Sunday, 1 Monday etc.
      let daysDiff = slot.dayOfWeek - currentDay;
      if (daysDiff <= 0) {
        daysDiff += 7; // force next week
      }
      
      const apptDate = new Date();
      apptDate.setDate(today.getDate() + daysDiff);
      
      const [hours, minutes] = slot.startTime.split(":");
      apptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await bookAppointmentAction({
        doctorId: selectedDoctor.id,
        availabilityId: slot.id,
        scheduledAt: apptDate.toISOString(),
        reason: bookingReason
      });

      if (response.success) {
        setBookedSuccess(true);
        toast.success(`Consultation successfully confirmed with ${selectedDoctor.name}!`);
        
        // Update local availabilities
        if (recommendations) {
          setRecommendations(prev => {
            if (!prev) return null;
            return prev.map(d => {
              if (d.id === selectedDoctor.id) {
                return {
                  ...d,
                  availabilities: d.availabilities.filter(a => a.id !== slot.id)
                };
              }
              return d;
            });
          });
        }

        setTimeout(() => {
          setSelectedDoctor(null);
          setSelectedSlot(null);
          setBookedSuccess(false);
        }, 2200);
      } else {
        toast.error(response.error || "Failed to schedule appointment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error scheduling appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  // Filter categories and items according to query
  const getFilteredCategories = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return SYMPTOM_CATEGORIES;

    const filtered: { [key: string]: string[] } = {};
    Object.entries(SYMPTOM_CATEGORIES).forEach(([category, items]) => {
      const matches = items.filter(item => 
        formatSymptomLabel(item).toLowerCase().includes(query) ||
        item.toLowerCase().includes(query)
      );
      if (matches.length > 0) {
        filtered[category] = matches;
      }
    });
    return filtered;
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Title bar */}
      <div className="border-b border-border/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-health-blue" />
            AI Symptom Checker
          </h1>
          <p className="text-xs text-muted-foreground">
            Evaluate symptoms against Kaggle-trained Random Forest and XGBoost medical classifiers.
          </p>
        </div>
        
        {selectedSymptoms.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearSelected}
            className="text-[10px] text-muted-foreground hover:text-destructive cursor-pointer h-8"
          >
            Clear Selected ({selectedSymptoms.length})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-health-blue animate-spin" />
          <span className="text-xs text-muted-foreground">Loading clinical symptoms catalog...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
          
          {/* Symptoms Selection Matrix Panel (left/middle) */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Describe Your Symptoms</CardTitle>
                <CardDescription className="text-xs">Type your symptoms in free-text format for AI analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="e.g., I have a persistent headache and nausea since yesterday morning, with occasional dizziness when I stand up."
                  className="w-full text-xs p-3 rounded-lg border border-border bg-background/50 h-20 focus-visible:outline-none focus:border-health-blue/40 resize-none font-sans"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Symptom Matrix</CardTitle>
                    <CardDescription className="text-xs">Search and check symptoms to run prediction.</CardDescription>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative flex items-center max-w-xs w-full">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search symptoms (e.g. cough, fever)..."
                      className="w-full h-8 pl-8 pr-3 text-[11px] rounded-lg border border-border bg-background/50 focus-visible:outline-none"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[550px] overflow-y-auto pr-1">
                {Object.keys(filteredCategories).length > 0 ? (
                  Object.entries(filteredCategories).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30 pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {items.map((s) => {
                          const isChecked = selectedSymptoms.includes(s);
                          return (
                            <button
                              key={s}
                              onClick={() => handleToggleSymptom(s)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all cursor-pointer ${
                                isChecked 
                                  ? "bg-health-blue/10 text-health-blue border-health-blue/30 shadow-xs" 
                                  : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              <span className="truncate pr-1">{formatSymptomLabel(s)}</span>
                              {isChecked && <Check className="h-3 w-3 shrink-0 text-health-blue" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    No symptoms match your search.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Diagnosis & Analysis Results Panel (right) */}
          <div className="space-y-6">
            
            {/* Selected checklist overview */}
            <Card>
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold">Selected Inputs</CardTitle>
                <CardDescription className="text-xs">Your current inputs for evaluation.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {(selectedSymptoms.length > 0 || symptomsText.trim() !== "") ? (
                  <>
                    {selectedSymptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                        {selectedSymptoms.map((s) => (
                          <span 
                            key={s} 
                            onClick={() => handleToggleSymptom(s)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground hover:bg-health-red/10 hover:text-health-red hover:border-health-red/20 border border-transparent font-medium cursor-pointer transition-colors"
                          >
                            {formatSymptomLabel(s)}
                            <X className="h-2.5 w-2.5" />
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {symptomsText.trim() !== "" && (
                      <div className="p-2 bg-muted/40 rounded border border-border text-[10px] text-muted-foreground line-clamp-2 italic">
                        "{symptomsText}"
                      </div>
                    )}
                    
                    <Button 
                      variant="vital" 
                      onClick={handlePredict} 
                      disabled={isAnalyzing}
                      className="w-full text-xs font-semibold h-9 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                          Evaluate Symptoms
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Describe symptoms or check tags on the left to begin analysis.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loading Analysis logs state */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-health-blue/20 bg-health-blue/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-health-blue animate-spin shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-health-blue uppercase tracking-wider">Symptom Analysis</span>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 animate-pulse">{analysisStep}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Panel */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-red-500/30 shadow-md bg-red-500/5">
                    <CardHeader className="pb-3 border-b border-red-500/20 bg-red-500/5">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
                        <ShieldAlert className="h-4 w-4" />
                        Analysis Failed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-xs text-red-600 font-semibold leading-relaxed">
                        {error}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Follow-Up Question panel */}
            <AnimatePresence>
              {followUpQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-health-blue/30 shadow-md">
                    <CardHeader className="pb-3 border-b border-border/40 bg-health-blue/5">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Brain className="h-4 w-4 text-health-blue animate-pulse" />
                        AI Follow-Up Assessment
                      </CardTitle>
                      <CardDescription className="text-xs">Help narrow down the diagnosis.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        {followUpHistory.map((item, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                              item.role === 'assistant' 
                                ? 'bg-health-blue/10 text-foreground mr-auto' 
                                : 'bg-muted text-muted-foreground ml-auto'
                            }`}
                          >
                            <span className="font-bold text-[9px] uppercase tracking-wider block opacity-70 mb-0.5">
                              {item.role === 'assistant' ? 'AegisHealth AI' : 'You'}
                            </span>
                            {item.content}
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={followUpAnswer}
                          onChange={(e) => setFollowUpAnswer(e.target.value)}
                          placeholder="Type response..."
                          disabled={isFollowUpLoading}
                          className="flex-1 h-8 px-2.5 text-xs rounded border border-border bg-background focus:outline-none focus:border-health-blue/40"
                        />
                        <Button 
                          type="submit" 
                          variant="vital" 
                          size="sm"
                          disabled={isFollowUpLoading || !followUpAnswer.trim()}
                          className="h-8 text-[10px] font-semibold cursor-pointer shrink-0"
                        >
                          {isFollowUpLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gemini Predictions Results card */}
            <AnimatePresence>
              {aiResults && aiResults.predictions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-4"
                >
                  {/* Emergency alert if high severity warning exists */}
                  {aiResults?.predictions?.[0]?.severity === "High" && (
                    <div className="p-3.5 bg-red-500/10 text-red-600 rounded-lg border border-red-500/25 flex gap-2.5 items-start text-xs shadow-xs">
                      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold uppercase tracking-wider text-[10px] text-red-700">Urgent Care Warning</div>
                        <p className="mt-0.5 text-[11px] text-red-600 leading-relaxed font-semibold">
                          {aiResults?.predictions?.[0]?.emergency_warning || "High severity detected. Please seek emergency medical care immediately."}
                        </p>
                      </div>
                    </div>
                  )}

                  <Card className="overflow-hidden border-border/80 shadow-md">
                    <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-health-blue" />
                        AI Diagnosis Results
                      </CardTitle>
                      <CardDescription className="text-xs">Top probable diagnoses & specialist matching.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4.5">
                      
                      {/* Top predicted diseases list */}
                      <div className="space-y-4">
                        {aiResults?.predictions?.map((p: any, idx: number) => {
                          const isTop = idx === 0;
                          const severityColors: any = {
                            "Low": "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
                            "Medium": "bg-amber-500/15 text-amber-600 border-amber-500/20",
                            "High": "bg-red-500/15 text-red-600 border-red-500/20"
                          };
                          const colorClass = severityColors[p.severity] || "bg-muted text-muted-foreground border-transparent";
                          
                          return (
                            <div key={p.disease} className={`space-y-1.5 ${!isTop ? "pt-3.5 border-t border-border/30" : ""}`}>
                              <div className="flex justify-between items-baseline gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass}`}>
                                    {p.severity}
                                  </span>
                                  <span className="text-xs font-bold text-foreground">{p.disease}</span>
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                                  Confidence: <strong className="text-foreground">{(p.confidence * 100).toFixed(0)}%</strong>
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${p.confidence * 100}%` }}
                                  transition={{ duration: 0.8 }}
                                  className={`h-full rounded-full ${isTop ? "bg-health-blue" : "bg-health-green/70"}`}
                                />
                              </div>

                              {isTop && (
                                <div className="space-y-2.5 pt-2 text-[10px] leading-relaxed text-muted-foreground">
                                  <p className="italic">"{p.description}"</p>
                                  
                                  <div className="space-y-1.5">
                                    <span className="font-bold text-[9px] uppercase tracking-wider text-foreground block">
                                      Recommended Action & Precautions:
                                    </span>
                                    <ul className="grid grid-cols-1 gap-1 pl-1">
                                      {p.precautions.map((item: string) => (
                                        <li key={item} className="flex items-start gap-1.5">
                                          <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/20 mt-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Referral Specialty</span>
                                    <span className="font-semibold text-health-blue bg-health-blue/10 px-2 py-0.5 rounded-md">
                                      {p.specialist}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </CardContent>
                    <CardFooter className="bg-muted/10 border-t border-border/40 p-3 flex flex-col gap-2 text-[9px] text-muted-foreground leading-relaxed">
                      <div className="flex gap-2">
                        <ShieldAlert className="h-4 w-4 text-health-orange shrink-0 mt-0.5" />
                        <span>
                          {aiResults?.disclaimer || "AegisHealthAI clinical predictions are generated for informational purposes only. Do not substitute this diagnosis for professional medical care."}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Specialist Recommendations Section */}
        <AnimatePresence>
          {(isFetchingRecs || (recommendations && recommendations.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-10 border-t border-border/40 pt-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <HeartHandshake className="h-5 w-5 text-health-blue animate-pulse" />
                    Recommended Specialists
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Top clinical experts matched to your predicted diagnosis.
                  </p>
                </div>
                {recommendations && recommendations.length > 0 && (
                  <span className="text-[10px] bg-health-blue/10 text-health-blue border border-health-blue/20 font-semibold px-2 py-0.5 rounded-full">
                    Matched {recommendations.length} Specialist{recommendations.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {isFetchingRecs ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Card key={idx} className="border-border/60">
                      <CardHeader className="pb-3 flex flex-row items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
                        <div className="flex gap-2 pt-2">
                          <div className="h-6 w-14 bg-muted animate-pulse rounded-lg" />
                          <div className="h-6 w-14 bg-muted animate-pulse rounded-lg" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                (() => {
                  const registeredDoctors = recommendations.filter(d => d.isRegistered);
                  const unregisteredDoctors = recommendations.filter(d => !d.isRegistered);
                  
                  return (
                    <div className="space-y-10">
                      {/* Registered Specialists */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-health-blue">
                          <UserCheck className="h-4 w-4 text-health-blue" />
                          Verified Registered Specialists (Booking Available)
                        </h3>

                        {registeredDoctors.length > 0 ? (
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {registeredDoctors.map((doctor, index) => {
                              const isSelected = selectedDoctor?.id === doctor.id;
                              const initial = doctor.name.replace("Dr. ", "").charAt(0);
                              
                              // Simple HSL color based on doctor initials
                              const hue = (initial.charCodeAt(0) * 15) % 360;
                              const bgStyle = { backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`, color: `hsl(${hue}, 80%, 45%)` };

                              return (
                                <motion.div
                                  key={doctor.id}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <Card className={`relative overflow-hidden hover:shadow-md transition-all h-full flex flex-col border border-border/80 ${
                                    isSelected ? "ring-2 ring-health-blue/40 border-health-blue/50" : ""
                                  }`}>
                                    <div className="absolute top-0 right-0 bg-health-blue text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                                      Verified Clinic
                                    </div>
                                    
                                    <CardHeader className="pb-2.5 flex flex-row items-start gap-3">
                                      <div 
                                        className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-current/10"
                                        style={bgStyle}
                                      >
                                        {initial}
                                      </div>
                                      <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                                          {doctor.name}
                                          <UserCheck className="h-3 w-3 text-health-green shrink-0" />
                                        </h3>
                                        <p className="text-[10px] font-semibold text-muted-foreground truncate">{doctor.specialty}</p>
                                      </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0 pb-4">
                                      {/* Rating / Exp Badges */}
                                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                        <div className="flex items-center gap-0.5 text-health-orange font-bold">
                                          <Star className="h-3 w-3 fill-current" />
                                          {doctor.averageRating.toFixed(1)}
                                        </div>
                                        <span className="text-muted-foreground font-medium">
                                          ({doctor.ratingCount} reviews)
                                        </span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="inline-flex items-center gap-1 font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-[9px]">
                                          <Award className="h-3 w-3 text-health-blue shrink-0" />
                                          {doctor.experienceYears} yrs exp
                                        </span>
                                      </div>

                                      {/* Bio */}
                                      {doctor.bio && (
                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic line-clamp-2">
                                          &ldquo;{doctor.bio}&rdquo;
                                        </p>
                                      )}

                                      {/* Contact Details */}
                                      <div className="bg-muted/30 border border-border/40 rounded-lg p-2.5 space-y-1.5 text-[10px] text-muted-foreground">
                                        <div className="flex items-start gap-1.5">
                                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                          <span className="line-clamp-2"><strong>Address:</strong> {doctor.address}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-1 border-t border-border/10">
                                          <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> {doctor.mobileNumber}</span>
                                          <span className="flex items-center gap-1"><Activity className="h-3 w-3 shrink-0" /> {doctor.clinicPhone}</span>
                                        </div>
                                      </div>

                                      {/* Available Slots */}
                                      <div className="space-y-1.5 pt-2 border-t border-border/30">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                                          Select Consultation Timeslot:
                                        </span>
                                        {doctor.availabilities.length > 0 ? (
                                          <div className="grid grid-cols-2 gap-1.5">
                                            {doctor.availabilities.map(slot => {
                                              const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                              const dayName = days[slot.dayOfWeek].substring(0, 3);
                                              const isSlotSelected = selectedSlot === slot.id && isSelected;
                                              
                                              return (
                                                <button
                                                  key={slot.id}
                                                  onClick={() => {
                                                    setSelectedDoctor(doctor);
                                                    setSelectedSlot(slot.id);
                                                  }}
                                                  className={`flex flex-col items-center p-1.5 rounded-lg border text-[9px] font-medium transition-all text-center cursor-pointer ${
                                                    isSlotSelected
                                                      ? "bg-health-blue/15 border-health-blue/50 text-health-blue font-bold shadow-xs"
                                                      : "bg-background border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                                  }`}
                                                >
                                                  <span className="uppercase tracking-wider font-bold text-[8px]">
                                                    {dayName} Slot
                                                  </span>
                                                  <span>
                                                    {slot.startTime} - {slot.endTime}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <span className="text-[9px] text-health-orange font-medium flex items-center gap-1">
                                            No upcoming slots available this week.
                                          </span>
                                        )}
                                      </div>

                                      {/* Action buttons */}
                                      <div className="flex gap-2 pt-2 border-t border-border/30">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full text-[9px] h-7 cursor-pointer border-health-blue text-health-blue hover:bg-health-blue/10"
                                          onClick={() => {
                                            setDirectionsDoctor(doctor);
                                            setShowDirections(true);
                                          }}
                                        >
                                          View Clinic Directions
                                        </Button>
                                      </div>

                                      {/* Inline booking confirmation expansion panel */}
                                      <AnimatePresence>
                                        {isSelected && selectedSlot && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pt-3 border-t border-border/40 space-y-2 text-left"
                                          >
                                            {bookedSuccess ? (
                                              <div className="flex flex-col items-center justify-center py-2 text-center text-health-green gap-1">
                                                <Check className="h-5 w-5 text-health-green shrink-0 animate-bounce" />
                                                <span className="text-[10px] font-bold">Booking Confirmed! Please wait...</span>
                                              </div>
                                            ) : (
                                              <>
                                                <div>
                                                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                                    Reason for consultation:
                                                  </label>
                                                  <textarea
                                                    value={bookingReason}
                                                    onChange={(e) => setBookingReason(e.target.value)}
                                                    placeholder="Describe symptoms briefly..."
                                                    className="w-full text-[10px] p-2 border border-border rounded bg-background/50 h-12 focus-visible:outline-none focus:border-health-blue/40 resize-none"
                                                  />
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button
                                                    variant="vital"
                                                    size="sm"
                                                    onClick={handleBookAppointment}
                                                    disabled={isBooking}
                                                    className="flex-1 text-[9px] font-semibold h-7 cursor-pointer"
                                                  >
                                                    {isBooking ? (
                                                      <>
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                        Scheduling...
                                                      </>
                                                    ) : (
                                                      "Confirm Booking"
                                                    )}
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                      setSelectedDoctor(null);
                                                      setSelectedSlot(null);
                                                    }}
                                                    className="text-[9px] font-semibold h-7 cursor-pointer"
                                                  >
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-border rounded-xl">
                            <ShieldAlert className="h-8 w-8 text-health-orange mx-auto mb-2 animate-bounce" />
                            <p className="text-xs font-bold text-foreground">No registered specialists found</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Please check with specialized practitioners below.</p>
                          </div>
                        )}
                      </div>

                      {/* Unregistered Specialists */}
                      <div className="space-y-4 pt-6 border-t border-border/40">
                        <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Stethoscope className="h-4 w-4" />
                          Other Specialized Practitioners (Unregistered - No Booking)
                        </h3>

                        {unregisteredDoctors.length > 0 ? (
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {unregisteredDoctors.map((doctor, index) => {
                              const initial = doctor.name.replace("Dr. ", "").charAt(0);
                              
                              // Simple HSL color based on doctor initials
                              const hue = (initial.charCodeAt(0) * 15) % 360;
                              const bgStyle = { backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`, color: `hsl(${hue}, 80%, 45%)` };

                              return (
                                <motion.div
                                  key={doctor.id}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <Card className="relative overflow-hidden hover:shadow-md transition-all h-full flex flex-col border border-border/60 opacity-90 hover:opacity-100">
                                    <CardHeader className="pb-2.5 flex flex-row items-start gap-3">
                                      <div 
                                        className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-current/10"
                                        style={bgStyle}
                                      >
                                        {initial}
                                      </div>
                                      <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-foreground truncate">
                                          {doctor.name}
                                        </h3>
                                        <p className="text-[10px] font-semibold text-muted-foreground truncate">{doctor.specialty}</p>
                                      </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0 pb-4">
                                      {/* Rating / Exp Badges */}
                                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                        <div className="flex items-center gap-0.5 text-health-orange font-bold">
                                          <Star className="h-3 w-3 fill-current" />
                                          {doctor.averageRating.toFixed(1)}
                                        </div>
                                        <span className="text-muted-foreground font-medium">
                                          ({doctor.ratingCount} reviews)
                                        </span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="inline-flex items-center gap-1 font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-[9px]">
                                          <Award className="h-3 w-3 text-health-blue shrink-0" />
                                          {doctor.experienceYears} yrs exp
                                        </span>
                                      </div>

                                      {/* Bio */}
                                      {doctor.bio && (
                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic line-clamp-2">
                                          &ldquo;{doctor.bio}&rdquo;
                                        </p>
                                      )}

                                      {/* Contact Details */}
                                      <div className="bg-muted/30 border border-border/40 rounded-lg p-2.5 space-y-1.5 text-[10px] text-muted-foreground">
                                        <div className="flex items-start gap-1.5">
                                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                          <span className="line-clamp-2"><strong>Address:</strong> {doctor.address}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] pt-1 border-t border-border/10">
                                          <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> {doctor.mobileNumber}</span>
                                          <span className="flex items-center gap-1"><Activity className="h-3 w-3 shrink-0" /> {doctor.clinicPhone}</span>
                                        </div>
                                      </div>

                                      {/* Booking Restriction Label */}
                                      <div className="p-2 rounded bg-health-orange/10 border border-health-orange/20 text-[9.5px] text-health-orange font-semibold text-center leading-relaxed">
                                        Consultation booking is only available for verified registered clinicians.
                                      </div>

                                      {/* Action buttons */}
                                      <div className="pt-2 border-t border-border/30">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full text-[9px] h-7 cursor-pointer border-health-blue text-health-blue hover:bg-health-blue/10"
                                          onClick={() => {
                                            setDirectionsDoctor(doctor);
                                            setShowDirections(true);
                                          }}
                                        >
                                          View Clinic Directions
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-border rounded-xl">
                            <p className="text-[11px] text-muted-foreground">No unregistered doctors found.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-10 border border-dashed border-border rounded-xl">
                  <ShieldAlert className="h-8 w-8 text-health-orange mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-foreground">No specialists found</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Please check with General Practitioners directly.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Directions Drawer Overlay */}
        <AnimatePresence>
          {showDirections && directionsDoctor && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDirections(false)}
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-[450px] bg-background border-l border-border shadow-2xl z-50 flex flex-col h-full overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-border/40 bg-muted/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-health-blue animate-bounce" />
                      Clinic Directions & Route
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Simulated step-by-step route to {directionsDoctor.name}'s clinic
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDirections(false)}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Clinic Details Card */}
                  <Card className="border-border/60">
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-health-blue shrink-0" />
                        <span className="font-bold text-foreground">Clinic Information</span>
                      </div>
                      <div className="space-y-2 text-muted-foreground">
                        <p className="font-semibold text-foreground">{directionsDoctor.name}</p>
                        <p className="text-[11px] font-semibold text-health-blue">{directionsDoctor.specialty}</p>
                        
                        <div className="pt-2 border-t border-border/20 space-y-1.5 text-[11px]">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <span><strong>Address:</strong> {directionsDoctor.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span><strong>Mobile:</strong> {directionsDoctor.mobileNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span><strong>Clinic Phone:</strong> {directionsDoctor.clinicPhone}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Animated Route Map Canvas */}
                  <div className="h-44 border border-border rounded-xl bg-muted/20 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/80 border border-border text-[8px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Live Animated Route
                    </div>
                    
                    {/* SVG Map Graphics */}
                    <svg viewBox="0 0 300 150" className="w-full h-full max-w-[280px]">
                      {/* Grid pattern background */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Dotted route path */}
                      <motion.path
                        d="M 40,75 C 100,20 200,130 260,75"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {/* Active pulsing path */}
                      <motion.path
                        d="M 40,75 C 100,20 200,130 260,75"
                        fill="none"
                        stroke="#0e7490"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="8 6"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                      
                      {/* Home / Patient Marker Node */}
                      <g transform="translate(40, 75)">
                        <circle r="12" fill="hsla(180, 70%, 50%, 0.15)" stroke="hsl(180, 80%, 40%)" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: "0px 0px" }} />
                        <circle r="7" fill="hsl(180, 80%, 45%)" />
                        <text y="4" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">H</text>
                      </g>

                      {/* Hospital / Clinic Marker Node */}
                      <g transform="translate(260, 75)">
                        <circle r="14" fill="hsla(0, 80%, 50%, 0.15)" stroke="hsl(0, 80%, 45%)" strokeWidth="1.5" className="animate-pulse" style={{ transformOrigin: "0px 0px" }} />
                        <circle r="8" fill="hsl(0, 80%, 50%)" />
                        <text y="4" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">+</text>
                      </g>

                      {/* Text labels */}
                      <text x="40" y="98" textAnchor="middle" fontSize="7" fontWeight="bold" fill="rgba(0,0,0,0.5)">You</text>
                      <text x="260" y="98" textAnchor="middle" fontSize="7" fontWeight="bold" fill="rgba(0,0,0,0.5)">Clinic</text>
                    </svg>
                  </div>

                  {/* Step-by-step Directions list */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Step-by-step Navigation:
                    </span>
                    <div className="relative border-l border-border pl-4 space-y-4 text-xs ml-2">
                      {getDirectionsForHospital(directionsDoctor.address || "").map((dir, idx) => (
                        <div key={idx} className="relative">
                          {/* Bullet Node */}
                          <span className="absolute -left-[21.5px] top-1 h-3 w-3 rounded-full border border-border bg-background flex items-center justify-center text-[7px] font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-foreground leading-relaxed font-medium">{dir.step}</p>
                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">{dir.dist}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/10 flex gap-2">
                  <Button
                    variant="vital"
                    className="w-full text-xs font-semibold h-9 cursor-pointer"
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionsDoctor.address || "")}`, "_blank");
                    }}
                  >
                    Open in Google Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs font-semibold h-9 cursor-pointer"
                    onClick={() => setShowDirections(false)}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </>
    )}

  </div>
);
}
