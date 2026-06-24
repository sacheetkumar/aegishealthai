"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Heart, 
  Calendar, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Stethoscope,
  FileText,
  Scale,
  TrendingUp,
  User,
  Settings,
  Phone,
  Plus,
  Trash2,
  Send,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  UserCheck,
  Bell
} from "lucide-react";

interface PatientDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  profile: {
    age: number;
    gender: string;
    bloodType: string;
    height: number;
    weight: number;
  };
}


export function PatientDashboardClient({ user, profile: initialProfile }: PatientDashboardProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [isSyncing, setIsSyncing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  const patientName = user.name || "Alex Rivera";
  const patientEmail = user.email || "patient@aegishealth.ai";

  // Calculate BMI
  const heightInMeters = profile.height / 100;
  const bmi = parseFloat((profile.weight / (heightInMeters * heightInMeters)).toFixed(1));

  let bmiCategory = { label: "Normal Weight", colorClass: "text-health-green", bgClass: "bg-health-green/10" };
  if (bmi < 18.5) {
    bmiCategory = { label: "Underweight", colorClass: "text-health-orange", bgClass: "bg-health-orange/10" };
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = { label: "Overweight", colorClass: "text-health-orange", bgClass: "bg-health-orange/10" };
  } else if (bmi >= 30) {
    bmiCategory = { label: "Obese", colorClass: "text-health-red", bgClass: "bg-health-red/10" };
  }

  // Set up demographic metrics
  const metrics = [
    { label: "Blood Group", value: profile.bloodType, subtext: "Clinical Blood Group", icon: Heart, colorClass: "text-health-red", bgClass: "bg-health-red/10" },
    { label: "Age & Gender", value: `${profile.age} yrs • ${profile.gender}`, subtext: "Demographic Records", icon: Activity, colorClass: "text-health-blue", bgClass: "bg-health-blue/10" },
    { label: "Height & Weight", value: `${profile.height} cm • ${profile.weight} kg`, subtext: "Biometric Readings", icon: Scale, colorClass: "text-health-green", bgClass: "bg-health-green/10" },
    { label: "Calculated BMI", value: bmi.toString(), subtext: bmiCategory.label, icon: TrendingUp, colorClass: bmiCategory.colorClass, bgClass: bmiCategory.bgClass },
  ];

  // Mock appointments
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      doctorName: "Dr. Sarah Jenkins",
      specialty: "Cardiology",
      time: "Tomorrow at 10:30 AM",
      status: "Confirmed",
      hospital: "Aegis Clinic, New Delhi"
    },
    {
      id: "2",
      doctorName: "Dr. Michael Chen",
      specialty: "Endocrinology",
      time: "June 25, 2026 at 2:00 PM",
      status: "Pending",
      hospital: "Metro Health Center, Mumbai"
    },
  ]);

  // Mock past predictions
  const [predictionHistory] = useState([
    { id: "p1", disease: "Fungal Infection / Dermatitis", confidence: 92, date: "June 19, 2026", symptoms: ["Skin Itching", "Red Spots"], status: "Resolved" },
    { id: "p2", disease: "Allergic Rhinitis / Bronchitis", confidence: 88, date: "June 12, 2026", symptoms: ["Sneezing", "Cough", "Throat Irritation"], status: "Consulted" },
    { id: "p3", disease: "Gastroenteritis", confidence: 79, date: "May 28, 2026", symptoms: ["Stomach Pain", "Nausea", "Vomiting"], status: "Resolved" }
  ]);

  // Mock prescriptions
  const [prescriptions] = useState([
    { id: "pr1", medication: "Cetirizine 10mg", dosage: "1 Tablet", frequency: "Once daily", duration: "10 Days", doctor: "Dr. Sarah Jenkins", date: "June 19, 2026" },
    { id: "pr2", medication: "Omeprazole 20mg", dosage: "1 Capsule", frequency: "Before breakfast", duration: "14 Days", doctor: "Dr. Rajesh Sharma", date: "May 28, 2026" }
  ]);

  // Mock medication reminders
  const [reminders, setReminders] = useState([
    { id: "r1", name: "Cetirizine 10mg", time: "09:00 PM", dosage: "1 Tablet", active: true, takenToday: false },
    { id: "r2", name: "Multivitamin", time: "08:00 AM", dosage: "1 Capsule", active: true, takenToday: true },
    { id: "r3", name: "Calcium Supplement", time: "01:00 PM", dosage: "1 Tablet", active: false, takenToday: false }
  ]);
  const [newReminderName, setNewReminderName] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderDosage, setNewReminderDosage] = useState("");

  // AI Assistant chat logs
  const [chatMessages, setChatMessages] = useState([
    { sender: "assistant", text: "Hello! I am your Aegis Health AI assistant. Ask me anything about your symptoms, predictions, or medication guidelines in India." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Emergency contact list state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: "e1", name: "Rohit Rivera (Brother)", relation: "Primary", phone: "+91 98765 43210" },
    { id: "e2", name: "Family Physician (Dr. Gupta)", relation: "Doctor", phone: "+91 99112 23344" }
  ]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // Profile Form state
  const [editAge, setEditAge] = useState(profile.age.toString());
  const [editHeight, setEditHeight] = useState(profile.height.toString());
  const [editWeight, setEditWeight] = useState(profile.weight.toString());
  const [editGender, setEditGender] = useState(profile.gender);
  const [editBloodType, setEditBloodType] = useState(profile.bloodType);

  // Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languagePreference, setLanguagePreference] = useState("English");

  const handleSyncRecords = () => {
    setIsSyncing(true);
    toast.loading("Synchronizing clinical biometric details with official Health Registry...", { id: "sync-toast" });
    
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Successfully synchronized patient profile with clinical database.", { 
        id: "sync-toast",
        description: "Demographics, height, weight, and blood group parameters updated."
      });
    }, 1800);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderName.trim() || !newReminderTime || !newReminderDosage.trim()) {
      toast.error("Please fill in all reminder fields.");
      return;
    }
    const newRem = {
      id: Date.now().toString(),
      name: newReminderName,
      time: newReminderTime,
      dosage: newReminderDosage,
      active: true,
      takenToday: false
    };
    setReminders([...reminders, newRem]);
    setNewReminderName("");
    setNewReminderTime("");
    setNewReminderDosage("");
    toast.success("Medication reminder added successfully!");
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleMarkTaken = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, takenToday: !r.takenToday } : r));
    toast.success("Daily medication intake status updated!");
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast.success("Medication reminder removed.");
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactRelation.trim() || !newContactPhone.trim()) {
      toast.error("Please fill in all contact fields.");
      return;
    }
    const newCont = {
      id: Date.now().toString(),
      name: newContactName,
      relation: newContactRelation,
      phone: newContactPhone
    };
    setEmergencyContacts([...emergencyContacts, newCont]);
    setNewContactName("");
    setNewContactRelation("");
    setNewContactPhone("");
    toast.success("Emergency contact added.");
  };

  const handleDeleteContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
    toast.success("Emergency contact deleted.");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "I have recorded your query. For accurate diagnostics, please consult with Dr. Sarah Jenkins or check the Disease Prediction Simulator.";
      const query = userText.toLowerCase();

      if (query.includes("fungal") || query.includes("itching")) {
        replyText = "Based on fungal infection correlations, we suggest keeping the skin dry, washing with anti-fungal soaps, and avoiding tight clothes. A Dermatologist match is recommended.";
      } else if (query.includes("sneezing") || query.includes("cough")) {
        replyText = "For cold/rhinitis symptoms, warm saline rinses and steam inhalations are highly effective. If fever persists, check with an Internal Medicine specialist.";
      } else if (query.includes("appointments") || query.includes("doctor")) {
        replyText = "You have an upcoming Cardiology appointment with Dr. Sarah Jenkins tomorrow at 10:30 AM.";
      } else if (query.includes("medication") || query.includes("cetirizine")) {
        replyText = "Cetirizine 10mg is scheduled for 09:00 PM. It is a non-drowsy antihistamine helper for respiratory allergies.";
      }

      setChatMessages(prev => [...prev, { sender: "assistant", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(editAge);
    const heightNum = parseFloat(editHeight);
    const weightNum = parseFloat(editWeight);

    if (isNaN(ageNum) || ageNum <= 0 || isNaN(heightNum) || heightNum <= 0 || isNaN(weightNum) || weightNum <= 0) {
      toast.error("Please enter valid positive numbers for age, height, and weight.");
      return;
    }

    setProfile({
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      gender: editGender,
      bloodType: editBloodType
    });

    toast.success("Profile parameters updated successfully!");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
  } as const;

  // Render Sub Views
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Metrics Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow relative">
                <div className={`absolute top-0 left-0 right-0 h-1 ${metric.colorClass.replace("text-", "bg-")}`} />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {metric.label}
                    </span>
                    <span className={`p-1 rounded-lg ${metric.bgClass} ${metric.colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight">{metric.value}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${metric.colorClass.replace("text-", "bg-")}`} />
                    <span className={`text-[10px] font-semibold ${metric.colorClass}`}>{metric.subtext}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Details Split Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core Profile */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Electronic Health Record Profile Registry
              </CardTitle>
              <CardDescription className="text-xs">
                Verified demographics registry records matching official identity structures.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 text-[11px]">
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground block font-medium">Full Registry Name</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5 block">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Secured Email Contact</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">{patientEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Gender Identity</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5 block">{profile.gender}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground block font-medium">Age</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5 block">{profile.age} years old</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Biometric Stats</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5 block">{profile.height} cm / {profile.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Emergency Blood Group</span>
                    <span className="text-xs font-bold text-health-red mt-0.5 block">{profile.bloodType}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/30 grid gap-4 sm:grid-cols-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block font-medium mb-1.5">Known Allergies Registry</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Penicillin", "Peanuts", "Sulfa Medications"].map((allergy) => (
                      <span key={allergy} className="px-2 py-0.5 bg-health-red/10 text-health-red rounded text-[10px] font-semibold border border-health-red/20">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium mb-1.5">Clinical Classification</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${bmiCategory.bgClass} ${bmiCategory.colorClass} ${bmiCategory.colorClass.replace("text-", "border-")}`}>
                    BMI Category: {bmiCategory.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Mini Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Care Team Visits</CardTitle>
                <CardDescription className="text-xs">Your upcoming consultations.</CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-border/50">
                {appointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-health-blue transition-colors">
                          {appt.doctorName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {appt.specialty} • <span className="font-semibold text-foreground/80">{appt.time}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-health-green/10 text-health-green border border-health-green/20">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );

  const renderPredictionHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-health-blue" />
          Prediction History
        </CardTitle>
        <CardDescription className="text-xs">
          Past diagnostic simulation logs from our Ensemble Learning models.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium bg-muted/20">
                <th className="py-2.5 px-4">Prognosis Result</th>
                <th className="py-2.5 px-4">Confidence</th>
                <th className="py-2.5 px-4">Symptoms Evaluated</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {predictionHistory.map((pred) => (
                <tr key={pred.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">{pred.disease}</td>
                  <td className="py-3 px-4 font-mono font-bold text-health-blue">{pred.confidence}%</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {pred.symptoms.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{pred.date}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                      pred.status === "Resolved" 
                        ? "bg-health-green/10 text-health-green border border-health-green/20"
                        : "bg-health-blue/10 text-health-blue border border-health-blue/20"
                    }`}>
                      {pred.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderHealthInsights = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-health-red" />
            Vitals Trend Logs
          </CardTitle>
          <CardDescription className="text-xs">Secure real-time diagnostic parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Avg Blood Pressure</span>
              <span className="text-xs font-bold text-foreground">118/79 mmHg (Normal)</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-health-green w-[85%]" />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Fasting Blood Glucose</span>
              <span className="text-xs font-bold text-foreground">94 mg/dL (Stable)</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-health-green w-[75%]" />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Avg Resting Heart Rate</span>
              <span className="text-xs font-bold text-foreground">72 bpm (Normal)</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-health-green w-[80%]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-health-blue" />
            AI Recommendations & Lifestyle Guidelines
          </CardTitle>
          <CardDescription className="text-xs">Based on Indian clinical parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          <div className="flex gap-2.5 p-3 rounded-lg bg-health-blue/10 border border-health-blue/20 text-health-blue">
            <p className="text-health-blue/90"><strong className="text-health-blue">Dietary Insights:</strong> Keep sodium intake under 2g/day. Prefer potassium-rich items (bananas, spinach) to support normal arterial blood pressures.</p>
          </div>
          <div className="flex gap-2.5 p-3 rounded-lg bg-health-blue/10 border border-health-blue/20 text-health-blue">
            <p className="text-health-blue/90"><strong className="text-health-blue">Physical Activity:</strong> Plan for 150 minutes of moderate aerobic exercises weekly. This supports healthy insulin sensitivity metrics.</p>
          </div>
          <div className="flex gap-2.5 p-3 rounded-lg bg-health-blue/10 border border-health-blue/20 text-health-blue">
            <p className="text-health-blue/90"><strong className="text-health-blue">Hydration & Sleep:</strong> Consume at least 2.5-3 liters of water daily. Ensure 7-8 hours of sound sleep for cardiorespiratory health.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecommendedSpecialists = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-health-blue" />
          Recommended Specialists in India
        </CardTitle>
        <CardDescription className="text-xs">
          Match credentials against your diagnostic results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "Dr. Sarah Jenkins", specialty: "Cardiologist", experience: "14 Years", location: "Aegis Clinic, New Delhi", rating: "4.9" },
            { name: "Dr. Rajesh Sharma", specialty: "Dermatologist", experience: "12 Years", location: "Medanta, Gurugram", rating: "4.8" }
          ].map((doc, idx) => (
            <div key={idx} className="p-4 border border-border rounded-xl space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-foreground">{doc.name}</h4>
                  <span className="text-[10px] font-semibold bg-health-blue/10 text-health-blue px-2 py-0.5 rounded">
                    ★ {doc.rating}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{doc.specialty} • {doc.experience} Experience</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" /> {doc.location}
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] w-full h-8">
                Request Consultation
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAppointments = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-health-blue" />
            Appointments
          </CardTitle>
          <CardDescription className="text-xs">Your upcoming medical consultations.</CardDescription>
        </div>
        <Button size="sm" className="text-[10px] h-8 cursor-pointer">
          <Plus className="mr-1 h-3.5 w-3.5" /> Book Consultation
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/50">
          {appointments.map((appt) => (
            <div key={appt.id} className="flex flex-col sm:flex-row justify-between sm:items-center py-4 first:pt-0 last:pb-0 gap-3">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-muted rounded-lg inline-block mt-0.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{appt.doctorName}</h4>
                  <p className="text-[10px] text-muted-foreground">{appt.specialty} • {appt.hospital}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">Scheduled: {appt.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full bg-health-green/10 text-health-green border border-health-green/20 h-fit">
                  {appt.status}
                </span>
                <Button size="sm" variant="outline" className="text-[9px] h-7 px-2 border-destructive hover:bg-destructive/10 hover:text-destructive">
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderPrescriptions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-health-blue" />
          Active Prescriptions
        </CardTitle>
        <CardDescription className="text-xs">Clinical prescriptions signed by verified medical practitioners.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {prescriptions.map((pr) => (
            <div key={pr.id} className="p-4 border border-border rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{pr.medication}</h4>
                  <p className="text-[10px] text-muted-foreground">{pr.dosage} ({pr.frequency})</p>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">{pr.date}</span>
              </div>
              <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
                <span>Duration: <strong>{pr.duration}</strong></span>
                <span>Dr: <strong>{pr.doctor}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAIAssistant = () => (
    <Card className="h-[520px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-health-blue" />
          Aegis AI Assistant
        </CardTitle>
        <CardDescription className="text-xs">Ask questions about symptoms, guidelines, or medications.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-3">
          {chatMessages.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted border border-border"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border rounded-xl p-3 text-xs italic text-muted-foreground animate-pulse">
                AI is typing...
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t border-border/40 bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Ask me a health question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-xs focus-visible:outline-none focus:border-health-blue/40"
          />
          <Button type="submit" variant="vital" size="sm" className="h-9 px-3">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );

  const renderMedicationReminders = () => (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Active reminders list */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-health-blue" />
            Medication Reminders
          </CardTitle>
          <CardDescription className="text-xs">Schedule daily pharmaceutical intake reminders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border/50">
            {reminders.map((rem) => (
              <div key={rem.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={rem.takenToday}
                    onChange={() => handleMarkTaken(rem.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary mt-0.5 cursor-pointer"
                  />
                  <div>
                    <h4 className={`text-xs font-bold ${rem.takenToday ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {rem.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Dosage: {rem.dosage} • Time: <span className="font-semibold text-foreground">{rem.time}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`px-2 py-0.5 text-[9px] font-semibold rounded ${
                      rem.active 
                        ? "bg-health-green/10 text-health-green border border-health-green/20" 
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {rem.active ? "Active" : "Disabled"}
                  </button>
                  <button 
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add reminder form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-health-blue" />
            Add Reminder
          </CardTitle>
          <CardDescription className="text-xs">Schedule new reminder.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddReminder} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Medication Name</label>
              <input
                type="text"
                placeholder="e.g. Cetirizine 10mg"
                value={newReminderName}
                onChange={(e) => setNewReminderName(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-background focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Reminder Time</label>
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-background focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Dosage</label>
              <input
                type="text"
                placeholder="e.g. 1 Tablet"
                value={newReminderDosage}
                onChange={(e) => setNewReminderDosage(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-background focus:outline-none"
              />
            </div>
            <Button type="submit" variant="vital" size="sm" className="w-full h-8 text-[10px]">
              Save Reminder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Indian Helpline listings */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-health-red" />
            Indian Medical Helpline Numbers
          </CardTitle>
          <CardDescription className="text-xs">
            Important healthcare emergency numbers in India.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "National Emergency Helpline", number: "112", desc: "Single emergency response system" },
              { label: "Medical Ambulance Helpline", number: "108 / 102", desc: "Free emergency ambulance services" },
              { label: "Central Health Helpline", number: "104", desc: "Medical consultation & support" },
              { label: "Women Helpline Helpline", number: "181", desc: "Emergency medical & safety support" }
            ].map((hp, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg bg-muted/15 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{hp.label}</h4>
                  <p className="text-[9px] text-muted-foreground">{hp.desc}</p>
                </div>
                <span className="font-mono font-bold text-health-red bg-health-red/10 px-2 py-1 rounded text-xs select-all">
                  {hp.number}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/40 space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
              <Heart className="h-4 w-4 text-health-red" /> Personal Emergency Contacts
            </h4>
            <div className="divide-y divide-border/50">
              {emergencyContacts.map((c) => (
                <div key={c.id} className="flex justify-between items-center py-2.5">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{c.name}</h5>
                    <p className="text-[10px] text-muted-foreground">Relation: {c.relation}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-xs text-foreground bg-muted px-2 py-0.5 rounded select-all">
                      {c.phone}
                    </span>
                    <button 
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add emergency contact form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-health-blue" />
            Add Contact
          </CardTitle>
          <CardDescription className="text-xs">Add emergency contact detail.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddContact} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rohit Sharma"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-background focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Relation</label>
              <input
                type="text"
                placeholder="e.g. Brother, Sister"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-background focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-background focus:outline-none"
              />
            </div>
            <Button type="submit" variant="vital" size="sm" className="w-full h-8 text-[10px]">
              Save Contact
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-health-blue" />
          Edit Demographic & Biometric Registry
        </CardTitle>
        <CardDescription className="text-xs">
          Manage your personal patient demographics registry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit} className="space-y-5 text-xs max-w-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Age (Years)</label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Gender Identity</label>
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Height (cm)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Weight (kg)</label>
              <input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">Blood Group</label>
              <select
                value={editBloodType}
                onChange={(e) => setEditBloodType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="vital" size="sm" className="px-5 h-9 font-semibold">
              Save Parameters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderAppSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4 text-health-blue" />
          Application Settings
        </CardTitle>
        <CardDescription className="text-xs">
          Manage system configurations, themes, notifications, and language clearances.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-xs max-w-xl">
        <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-muted/10">
          <div>
            <h4 className="font-bold text-foreground">Language Preference</h4>
            <p className="text-[10px] text-muted-foreground">Select interface translation configurations.</p>
          </div>
          <select
            value={languagePreference}
            onChange={(e) => setLanguagePreference(e.target.value)}
            className="h-8 px-2 text-[10px] font-semibold rounded-lg border border-border bg-background focus:outline-none"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Bengali">বাংলা (Bengali)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
          </select>
        </div>

        <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-muted/10">
          <div>
            <h4 className="font-bold text-foreground">Reminders & Alerts</h4>
            <p className="text-[10px] text-muted-foreground">Enable system notifications for medications.</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`px-3 py-1 rounded text-[10px] font-semibold border ${
              notificationsEnabled 
                ? "bg-health-green/10 text-health-green border-health-green/20" 
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {notificationsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-muted/10">
          <div>
            <h4 className="font-bold text-foreground">Security Audits</h4>
            <p className="text-[10px] text-muted-foreground">Check active session keys and security backups.</p>
          </div>
          <span className="text-[9px] font-semibold text-health-green bg-health-green/10 px-2 py-0.5 rounded border border-health-green/20">
            ALL SYSTEMS SECURE
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Title / Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-health-blue" />
            {activeTab === "overview" && "Patient Health Dashboard"}
            {activeTab === "prediction-history" && "Prediction History"}
            {activeTab === "health-insights" && "Health Insights"}
            {activeTab === "recommended-specialists" && "Recommended Specialists"}
            {activeTab === "appointments" && "Consultations"}
            {activeTab === "prescriptions" && "Prescriptions"}
            {activeTab === "ai-assistant" && "Aegis AI Assistant"}
            {activeTab === "medication-reminders" && "Medication Reminders"}
            {activeTab === "emergency-contacts" && "Emergency Helpline Support"}
            {activeTab === "profile" && "Demographics Profile"}
            {activeTab === "settings" && "System Settings"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Synchronized clinical logs under secure encryption.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="vital" 
            size="sm" 
            loading={isSyncing}
            onClick={handleSyncRecords}
            className="text-[10px] h-8 flex items-center gap-1 cursor-pointer"
          >
            {!isSyncing && <Sparkles className="h-3.5 w-3.5" />}
            Sync Health Records
          </Button>
        </div>
      </div>

      {/* Conditionally render tab content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "prediction-history" && renderPredictionHistory()}
      {activeTab === "health-insights" && renderHealthInsights()}
      {activeTab === "recommended-specialists" && renderRecommendedSpecialists()}
      {activeTab === "appointments" && renderAppointments()}
      {activeTab === "prescriptions" && renderPrescriptions()}
      {activeTab === "ai-assistant" && renderAIAssistant()}
      {activeTab === "medication-reminders" && renderMedicationReminders()}
      {activeTab === "emergency-contacts" && renderEmergencyContacts()}
      {activeTab === "profile" && renderProfileSettings()}
      {activeTab === "settings" && renderAppSettings()}

    </div>
  );
}
