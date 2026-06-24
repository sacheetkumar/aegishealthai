"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  Brain, 
  Stethoscope, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Clock, 
  Star, 
  Award, 
  UserCheck, 
  HeartHandshake, 
  X, 
  Loader2, 
  ShieldCheck,
  Heart,
  Flame 
} from "lucide-react";
import { getDoctorRecommendations, type RecommendedDoctor } from "@/features/doctors/actions/recommend-doctors";
import { bookAppointmentAction } from "@/features/doctors/actions/book-appointment";
import { parsePrescriptionAction } from "@/features/patients/actions/parse-prescription";
import Tesseract from "tesseract.js";

interface PrescriptionTemplate {
  name: string;
  description: string;
  rawText: string;
  disease: string;
  medications: string[];
  symptoms: string[];
  precautions: string[];
}

const PRESCRIPTION_TEMPLATES: Record<string, PrescriptionTemplate> = {
  hypertension: {
    name: "Hypertension (Cardiology)",
    description: "Lisinopril prescription noting chest pain & persistent cough",
    rawText: "Rx:\nLisinopril 10mg -- take once daily in the morning.\nPatient: Alex Rivera\nClinical Notes: Patient reports chest pain/tightness, dry persistent cough, and occasional palpitations.\nVitals: Blood pressure measured at 145/92 mmHg.",
    disease: "Hypertension",
    medications: ["Lisinopril 10mg"],
    symptoms: ["chest_pain", "cough", "palpitations"],
    precautions: [
      "Reduce daily dietary sodium intake to under 1500mg.",
      "Avoid sudden posture changes to prevent orthostatic dizziness.",
      "Monitor blood pressure daily in the morning and log parameters.",
      "Limit caffeine, alcohol, and excessive physical exhaustion."
    ]
  },
  diabetes: {
    name: "Diabetes (Endocrinology)",
    description: "Metformin prescription noting polyuria & weight loss",
    rawText: "Rx:\nMetformin 500mg -- take twice daily with meals.\nPatient: Alex Rivera\nClinical Notes: Patient reports polydipsia, frequent urination (polyuria), increased appetite, and unexplained weight loss.\nLabs: Fasting blood glucose is 184 mg/dL.",
    disease: "Diabetes",
    medications: ["Metformin 500mg"],
    symptoms: ["polyuria", "weight_loss", "increased_appetite"],
    precautions: [
      "Follow a strict low glycemic index diabetic meal plan.",
      "Check blood glucose levels twice daily (fasting and post-meals).",
      "Engage in regular low-impact aerobic exercise daily.",
      "Carry fast-acting glucose tablets in case of hypoglycemia."
    ]
  },
  acne: {
    name: "Acne Vulgaris (Dermatology)",
    description: "Benzoyl Peroxide prescription noting skin itching & pustules",
    rawText: "Rx:\nBenzoyl Peroxide gel 5% -- apply thin layer to face daily at night.\nPatient: Alex Rivera\nClinical Notes: Patient presents with facial skin itching, skin peeling, red spots, and active pus-filled pimples (pustules) over cheeks.\nAvoid contact with eyes.",
    disease: "Acne",
    medications: ["Benzoyl Peroxide gel 5%"],
    symptoms: ["itching", "skin_rash", "pus_filled_pimples"],
    precautions: [
      "Apply oil-free, non-comedogenic moisturizers and sunscreens.",
      "Avoid scratching, picking, or squeezing acne pustules.",
      "Use gentle, soap-free cleansers twice daily.",
      "Avoid excessive sun exposure; wash face after physical exercise."
    ]
  }
};

const formatSymptomLabel = (s: string) => {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
};

export default function OcrPrescriptionPage() {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("hypertension");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepLog, setScanStepLog] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Extracted data state
  const [scannedData, setScannedData] = useState<PrescriptionTemplate | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedDoctor[] | null>(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);

  // Parsed OCR states
  const [prescribedDoctor, setPrescribedDoctor] = useState<RecommendedDoctor | null>(null);
  const [extractedPatientName, setExtractedPatientName] = useState<string | null>(null);
  const [extractedDoctorName, setExtractedDoctorName] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState<RecommendedDoctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingReason, setBookingReason] = useState("OCR scanned prescription follow-up");
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (droppedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(droppedFile));
      } else {
        setFilePreview(null);
      }
      setShowResults(false);
      setRecommendations(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
      setShowResults(false);
      setRecommendations(null);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFilePreview(null);
    setShowResults(false);
    setRecommendations(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPrescribedDoctor(null);
    setExtractedPatientName(null);
    setExtractedDoctorName(null);
    setScanError(null);
  };

  const executeOcrScan = async () => {
    setIsScanning(true);
    setShowResults(false);
    setRecommendations(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPrescribedDoctor(null);
    setExtractedPatientName(null);
    setExtractedDoctorName(null);
    setScanError(null);

    try {
      let rawText = "";
      let diseaseName = "";
      let patientName: string | null = null;
      let doctorName: string | null = null;
      let medications: string[] = [];
      let symptoms: string[] = [];
      let precautions: string[] = [];
      let prescrDoc: RecommendedDoctor | null = null;

      if (file) {
        setScanStepLog("Initializing Tesseract OCR WebAssembly engine...");
        
        // Run client-side Tesseract OCR with progress logging
        const result = await Tesseract.recognize(file, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setScanStepLog(`Extracting text parameters: ${Math.round(m.progress * 100)}%`);
            } else {
              setScanStepLog(m.status.charAt(0).toUpperCase() + m.status.slice(1) + "...");
            }
          },
        });

        rawText = result.data.text;
        
        if (!rawText || rawText.trim().length < 15) {
          throw new Error("OCR scan produced insufficient or illegible text. Please upload a clearer image of a prescription.");
        }

        setScanStepLog("Verifying medical parameters via Aegis AI parser...");
        
        const parseResponse = await parsePrescriptionAction(rawText);
        if (!parseResponse.success) {
          throw new Error(parseResponse.error || "Failed to parse prescription data.");
        }

        diseaseName = parseResponse.data?.disease || "General";
        patientName = parseResponse.data?.patientName || null;
        doctorName = parseResponse.data?.doctorName || null;
        medications = parseResponse.data?.medications || [];
        symptoms = parseResponse.data?.symptoms || [];
        precautions = parseResponse.data?.precautions || [];
        prescrDoc = parseResponse.prescribedDoctor || null;
      } else {
        // Fallback to presets scenario templates
        const steps = [
          "Binarizing preset document layouts...",
          "Parsing preset Rx entities...",
          "Mapping symptoms to clinical DB...",
          "Finalizing preset logs..."
        ];

        for (let i = 0; i < steps.length; i++) {
          setScanStepLog(steps[i]);
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        const matchedTemplate = PRESCRIPTION_TEMPLATES[selectedTemplateKey];
        rawText = matchedTemplate.rawText;
        diseaseName = matchedTemplate.disease;
        medications = matchedTemplate.medications;
        symptoms = matchedTemplate.symptoms;
        precautions = matchedTemplate.precautions;
        patientName = "Alex Rivera";
        
        // For scenario template, let's search if default doc exists
        try {
          const parseResponse = await parsePrescriptionAction(rawText);
          if (parseResponse.success && parseResponse.isPrescription) {
            prescrDoc = parseResponse.prescribedDoctor || null;
            doctorName = parseResponse.data?.doctorName || "Dr. Vikram Rao";
          } else {
            doctorName = "Dr. Vikram Rao";
          }
        } catch (e) {
          console.warn("Could not fetch prescribed doctor for preset:", e);
          doctorName = "Dr. Vikram Rao";
        }
      }

      setScannedData({
        name: diseaseName,
        description: "Clinical Prescription scan",
        rawText,
        disease: diseaseName,
        medications,
        symptoms,
        precautions,
      });

      setExtractedPatientName(patientName);
      setExtractedDoctorName(doctorName);
      setPrescribedDoctor(prescrDoc);
      setShowResults(true);
      toast.success("Prescription OCR scan completed successfully!");

      // Fetch recommended alternative doctors
      setIsFetchingRecs(true);
      try {
        const recs = await getDoctorRecommendations(diseaseName);
        // Filter out the prescribed doctor from the alternatives list
        if (prescrDoc) {
          setRecommendations(recs.filter(r => r.id !== prescrDoc!.id));
        } else {
          setRecommendations(recs);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch matching medical specialists.");
      } finally {
        setIsFetchingRecs(false);
      }

    } catch (err: any) {
      console.error("OCR Scan Process Error:", err);
      const errMsg = err.message || "An unexpected error occurred during OCR scanning.";
      setScanError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsScanning(false);
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
      const today = new Date();
      const currentDay = today.getDay();
      let daysDiff = slot.dayOfWeek - currentDay;
      if (daysDiff <= 0) {
        daysDiff += 7;
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
        toast.error(response.error || "Failed to book appointment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error scheduling appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const renderDoctorCard = (doctor: RecommendedDoctor, isPrescribed = false) => {
    const isSelected = selectedDoctor?.id === doctor.id;
    const initial = doctor.name.replace("Dr. ", "").charAt(0);
    const hue = (initial.charCodeAt(0) * 25) % 360;
    const avatarStyle = { backgroundColor: `hsla(${hue}, 75%, 45%, 0.1)`, color: `hsl(${hue}, 85%, 40%)` };

    return (
      <Card 
        key={doctor.id}
        className={`relative overflow-hidden hover:shadow-md transition-all flex flex-col border border-border/80 ${
          isSelected ? "ring-2 ring-health-blue/40 border-health-blue/50" : ""
        } ${isPrescribed ? "border-health-green/40 bg-health-green/5 shadow-sm" : ""}`}
      >
        {isPrescribed && (
          <div className="absolute top-0 right-0 bg-health-green text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl tracking-wider flex items-center gap-0.5">
            <Check className="h-2 w-2" /> Prescribed
          </div>
        )}
        <CardHeader className="pb-2 flex flex-row items-start gap-3">
          <div 
            className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-current/10"
            style={avatarStyle}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
              {doctor.name}
              <UserCheck className="h-3.5 w-3.5 text-health-green shrink-0" />
            </h4>
            <p className="text-[10px] font-semibold text-muted-foreground truncate">{doctor.specialty}</p>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-0.5 text-health-orange font-bold">
              <Star className="h-3 w-3 fill-current" />
              {doctor.averageRating.toFixed(1)}
            </div>
            <span className="text-muted-foreground">({doctor.ratingCount} reviews)</span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-[8px]">
              <Award className="h-3 w-3 text-health-blue" />
              {doctor.experienceYears} yrs exp
            </span>
          </div>

          {doctor.bio && (
            <p className="text-[10px] text-muted-foreground italic line-clamp-2">
              &ldquo;{doctor.bio}&rdquo;
            </p>
          )}

          {/* Available Slots */}
          <div className="space-y-1 pt-2 border-t border-border/30">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Available Slots:</span>
            {doctor.availabilities.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {doctor.availabilities.map(slot => {
                  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const dayName = days[slot.dayOfWeek];
                  const isSlotSelected = selectedSlot === slot.id && isSelected;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setSelectedSlot(slot.id);
                      }}
                      className={`flex flex-col items-center p-1 rounded-lg border text-[9px] font-medium transition-all text-center cursor-pointer ${
                        isSlotSelected
                          ? "bg-health-blue/15 border-health-blue/50 text-health-blue font-bold"
                          : "bg-background border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                      }`}
                    >
                      <span className="uppercase tracking-wider font-bold text-[7px]">{dayName}</span>
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-[9px] text-health-orange font-medium">No available slots this week.</span>
            )}
          </div>

          {/* Booking form */}
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
                    <Check className="h-4.5 w-4.5 text-health-green shrink-0 animate-bounce" />
                    <span className="text-[10px] font-bold">Booking Confirmed! Please wait...</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Reason for consultation:</label>
                      <textarea
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        className="w-full text-[10px] p-2 border border-border rounded bg-background/50 h-12 focus:outline-none resize-none"
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
                        {isBooking ? "Scheduling..." : "Confirm Booking"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedDoctor(null); setSelectedSlot(null); }}
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
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Title bar */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-health-blue" />
          OCR Prescription Scanner
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload and scan prescription charts to extract clinical symptoms, identify diagnosis details, and book consultations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column: Drag & Drop File Upload */}
        <div className="space-y-4 md:col-span-1">
          
          {/* Preset Template Selector */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scenario Templates</CardTitle>
              <CardDescription className="text-[11px]">Select a scenario to test OCR extraction logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {Object.entries(PRESCRIPTION_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedTemplateKey(key); handleClearFile(); }}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-semibold flex flex-col gap-0.5 transition-all cursor-pointer ${
                    selectedTemplateKey === key && !file
                      ? "bg-health-blue/10 text-health-blue border-health-blue/30"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    {key === "hypertension" && <Heart className="h-3.5 w-3.5" />}
                    {key === "diabetes" && <Flame className="h-3.5 w-3.5" />}
                    {key === "acne" && <Brain className="h-3.5 w-3.5" />}
                    {template.name}
                  </span>
                  <span className="text-[10px] opacity-80 font-normal line-clamp-1">{template.description}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Drag and Drop Zone */}
          <Card>
            <CardContent className="p-5">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] ${
                  file 
                    ? "border-health-blue/30 bg-health-blue/5" 
                    : "border-border hover:bg-muted/20"
                }`}
              >
                {filePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={filePreview} 
                      alt="Prescription preview" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : file ? (
                  <FileText className="h-12 w-12 text-health-blue animate-pulse" />
                ) : (
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                )}

                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    {file ? file.name : "Drag & drop prescription file"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, PNG, JPG up to 8MB"}
                  </p>
                </div>

                {!file && (
                  <div>
                    <label className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-[10px] font-bold text-foreground cursor-pointer border border-border transition-colors">
                      Select Local File
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}

                {file && (
                  <button 
                    onClick={handleClearFile}
                    className="text-[10px] text-destructive hover:underline font-bold cursor-pointer"
                  >
                    Remove File
                  </button>
                )}
              </div>

              <div className="mt-4">
                <Button 
                  variant="vital" 
                  onClick={executeOcrScan}
                  disabled={isScanning}
                  className="w-full text-xs font-semibold h-9 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Scanning Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Scan Prescription
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scanner Step Logs (Visible only during scanning) */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-health-blue/20 bg-health-blue/5 overflow-hidden">
                  <div className="relative h-1 bg-health-blue animate-pulse w-full">
                    <motion.div 
                      className="h-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5 }}
                    />
                  </div>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-health-blue animate-spin shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-health-blue uppercase tracking-wider block">Neural parser logs</span>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5 animate-pulse">
                        {scanStepLog}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Middle/Right Columns: Scan Results and Doctors referrals */}
        <div className="space-y-6 md:col-span-2">
          
          {scanError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-destructive/30 bg-destructive/5 text-destructive overflow-hidden shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    Prescription Scanning Error
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-[11px] text-destructive/90 leading-relaxed font-semibold">
                    {scanError}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!showResults && !isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl min-h-[350px] text-center"
              >
                <FileText className="h-16 w-16 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-bold text-foreground">AegisHealth OCR Reader</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Upload a scanned medical document or choose a scenario on the left, then click "Scan Prescription" to isolate diagnostic results.
                </p>
              </motion.div>
            )}

            {showResults && scannedData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6"
              >
                {/* Result Card: Scanned Text and Extracted Entities */}
                <Card className="overflow-hidden border border-border/80 shadow-md">
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-health-blue" />
                      OCR Diagnostic Results
                    </CardTitle>
                    <CardDescription className="text-xs">Extracted textual parameters and structured health entities.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    
                    {/* Extracted Patient and Doctor Names */}
                    {(extractedPatientName || extractedDoctorName) && (
                      <div className="grid gap-4 grid-cols-2 pb-3 border-b border-border/30">
                        <div>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Extracted Patient</span>
                          <span className="text-xs font-bold text-foreground">{extractedPatientName || "Not detected"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Prescribed Doctor</span>
                          <span className="text-xs font-bold text-foreground">{extractedDoctorName || "Not detected"}</span>
                        </div>
                      </div>
                    )}

                    {/* Raw Text Highlighted */}
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Extracted Prescription Text</span>
                      <pre className="p-3.5 rounded-lg border border-border/60 bg-muted/30 text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-foreground/90 select-text">
                        {scannedData.rawText}
                      </pre>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/30">
                      {/* Parsed Pharmaceuticals */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Identified Medications</span>
                        <div className="flex flex-wrap gap-1.5">
                          {scannedData.medications.map(med => (
                            <span key={med} className="px-2 py-0.5 bg-health-blue/10 text-health-blue rounded text-[10px] font-bold border border-health-blue/20">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mapped Symptoms */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Extracted Symptoms</span>
                        <div className="flex flex-wrap gap-1.5">
                          {scannedData.symptoms.map(sym => (
                            <span key={sym} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-semibold border border-border">
                              {formatSymptomLabel(sym)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/30 grid gap-4 sm:grid-cols-3 items-start">
                      
                      {/* Matched Disease */}
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">AI Prognosis Match</span>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-health-green shrink-0 animate-ping" />
                          <span className="text-xs font-extrabold text-foreground">{scannedData.disease}</span>
                        </div>
                      </div>

                      {/* Precautions lists */}
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Clinical Precautions</span>
                        <ul className="space-y-1">
                          {scannedData.precautions.map((prec, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                              <span className="text-health-blue font-bold mt-0.5 shrink-0">•</span>
                              <span>{prec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                  </CardContent>
                </Card>

                {/* Prescribed Doctor Section */}
                {prescribedDoctor ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pt-2">
                      <UserCheck className="h-4.5 w-4.5 text-health-green" />
                      Prescribed Doctor (Registered in Network)
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {renderDoctorCard(prescribedDoctor, true)}
                    </div>
                  </div>
                ) : extractedDoctorName ? (
                  <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 text-xs text-yellow-700 dark:text-yellow-400">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-yellow-800 dark:text-yellow-300">Prescribing Doctor Not Registered</p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        &ldquo;{extractedDoctorName}&rdquo; was extracted from the prescription but is not currently registered in the AegisHealthAI network. Please book an appointment with our recommended specialists below.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Specialist Referrals */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pt-2">
                    <HeartHandshake className="h-4.5 w-4.5 text-health-blue animate-pulse" />
                    {prescribedDoctor ? "Alternative Recommended Specialists Referrals" : "Recommended Specialists Referrals"}
                  </h3>

                  {isFetchingRecs ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <Card key={idx} className="border-border/60">
                          <CardHeader className="pb-2 flex flex-row items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                            <div className="space-y-1.5 flex-1">
                              <div className="h-3.5 w-24 bg-muted animate-pulse rounded" />
                              <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
                            </div>
                          </CardHeader>
                          <CardContent className="h-24 bg-muted/10 animate-pulse" />
                        </Card>
                      ))}
                    </div>
                  ) : recommendations && recommendations.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {recommendations.map((doctor) => renderDoctorCard(doctor, false))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-xl">
                      <ShieldAlert className="h-7 w-7 text-health-orange mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-foreground">No specialists referrals matches found</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Please consult General Practitioners directly.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

      </div>

    </div>
  );
}
