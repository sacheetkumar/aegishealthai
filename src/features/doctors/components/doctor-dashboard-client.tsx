"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/feedback/skeleton";
import { 
  Users, 
  Calendar, 
  Plus, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Briefcase,
  Search,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

interface DoctorDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  profile: {
    specialty: string;
    licenseNumber: string;
  };
}

export function DoctorDashboardClient({ user, profile }: DoctorDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);
  
  // Prescription Form state
  const [prescForm, setPrescForm] = useState({
    patientName: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const doctorName = user.name || "Dr. Sarah Jenkins";

  // Mock list of doctor patients
  const [doctorPatients] = useState([
    { id: "101", name: "Alex Rivera", age: 38, reason: "Heart flutter inspection", time: "10:30 AM", status: "Active" },
    { id: "102", name: "Maria Gonzalez", age: 62, reason: "Post-surgery checkup", time: "11:45 AM", status: "Completed" },
    { id: "103", name: "Marcus Stone", age: 29, reason: "EKG validation", time: "01:30 PM", status: "Pending" },
  ]);

  // Mock charts volume analytics
  const analyticsData = [
    { name: "Week 1", completed: 15, pending: 4 },
    { name: "Week 2", completed: 18, pending: 5 },
    { name: "Week 3", completed: 24, pending: 8 },
    { name: "Week 4", completed: 20, pending: 3 },
  ];

  const filteredPatients = doctorPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescForm.patientName || !prescForm.medication || !prescForm.dosage) {
      toast.error("Please fill in the patient name, medication name, and dosage details.");
      return;
    }

    setIsSubmittingPrescription(true);
    toast.loading(`Drafting prescription for ${prescForm.patientName}...`, { id: "prescription-toast" });

    setTimeout(() => {
      setIsSubmittingPrescription(false);
      setIsPrescriptionModalOpen(false);
      toast.success(`Prescription signed and issued to ${prescForm.patientName}!`, {
        id: "prescription-toast",
        description: `${prescForm.medication} ${prescForm.dosage} (${prescForm.frequency || "as directed"}) registered in secure health record.`
      });
      // Clear form
      setPrescForm({ patientName: "", medication: "", dosage: "", frequency: "", duration: "" });
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } }
  } as const;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 relative">
      
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-health-blue" />
            Clinical Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Active medical officer session: <span className="font-semibold text-foreground">{doctorName}</span> • Specialty: <span className="text-health-blue font-semibold">{profile.specialty}</span>
          </p>
        </div>
        
        <Button 
          variant="vital" 
          size="sm" 
          onClick={() => setIsPrescriptionModalOpen(true)}
          className="text-[10px] h-8 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Write Prescription
        </Button>
      </div>

      {/* Analytics counts grids */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="p-2.5 bg-health-blue/10 text-health-blue rounded-lg">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Assigned Patients</p>
                <p className="text-xl font-bold tracking-tight mt-0.5">24</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="p-2.5 bg-health-green/10 text-health-green rounded-lg">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Today&apos;s Consults</p>
                <p className="text-xl font-bold tracking-tight mt-0.5">3</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="p-2.5 bg-health-orange/10 text-health-orange rounded-lg">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pending Tasks</p>
                <p className="text-xl font-bold tracking-tight mt-0.5">5</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Core Panels split */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Patient Consult list logs */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">Consultation Queue</CardTitle>
                <CardDescription className="text-xs">Patient queue list scheduled for: {formatDate(new Date())}</CardDescription>
              </div>
              
              {/* Search bar */}
              <div className="relative flex items-center max-w-xs w-full">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or symptoms..."
                  className="w-full h-8 pl-8 pr-3 text-[11px] rounded-lg border border-border bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredPatients.length > 0 ? (
              <div className="divide-y divide-border/50">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground mt-0.5">
                        {patient.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-health-blue transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Age: {patient.age} • Consultation: <span className="font-semibold text-foreground/80">{patient.reason}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                        patient.status === "Completed"
                          ? "bg-health-green/10 text-health-green border-health-green/20"
                          : patient.status === "Active"
                          ? "bg-health-blue/10 text-health-blue border-health-blue/20"
                          : "bg-health-orange/10 text-health-orange border-health-orange/20"
                      }`}>
                        {patient.status}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {patient.time}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No patients match the search criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics chart and registries */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-health-blue" />
                Case Consultation History
              </CardTitle>
              <CardDescription className="text-[10px]">Weekly tracking analytics logs.</CardDescription>
            </CardHeader>
            <CardContent className="h-[150px] pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={9} stroke="#888888" tickLine={false} />
                    <YAxis fontSize={9} stroke="#888888" tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "6px" }} />
                    <Area type="monotone" dataKey="completed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Completed" />
                    <Area type="monotone" dataKey="pending" stroke="#fb923c" fill="#fb923c" fillOpacity={0.1} name="Pending" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full animate-pulse" />
              )}
            </CardContent>
          </Card>

          {/* Licenses registries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-health-green" />
                Licensing registry
              </CardTitle>
              <CardDescription className="text-xs">Practitioner credentials validation.</CardDescription>
            </CardHeader>
            <CardContent className="text-[11px] space-y-3 pt-0">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Medical License ID
                </span>
                <span className="font-mono font-semibold text-foreground">{profile.licenseNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Role Clearances</span>
                <span className="font-semibold text-health-blue bg-health-blue/10 px-2 py-0.5 rounded">PRACTITIONER</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Security Audits</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-health-green" /> COMPLIANT
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Prescription Drafting Modal Drawer */}
      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] bg-card border border-border rounded-xl shadow-xl z-55 overflow-hidden flex flex-col"
            >
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-health-blue" />
                  Issue Clinical Prescription
                </CardTitle>
                <CardDescription className="text-xs">Issue pharmaceutical instructions directly to the patient record.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 overflow-y-auto">
                <form onSubmit={handleCreatePrescriptionSubmit} className="space-y-4 text-xs">
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Patient Name</label>
                    <select
                      value={prescForm.patientName}
                      onChange={(e) => setPrescForm({ ...prescForm, patientName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Select a patient...</option>
                      {doctorPatients.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Lisinopril, Metformin"
                      value={prescForm.medication}
                      onChange={(e) => setPrescForm({ ...prescForm, medication: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 10mg, 500mg"
                        value={prescForm.dosage}
                        onChange={(e) => setPrescForm({ ...prescForm, dosage: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Frequency</label>
                      <input
                        type="text"
                        placeholder="e.g. Once daily, Twice daily"
                        value={prescForm.frequency}
                        onChange={(e) => setPrescForm({ ...prescForm, frequency: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 30 days, 12 weeks"
                      value={prescForm.duration}
                      onChange={(e) => setPrescForm({ ...prescForm, duration: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-3 border-t border-border/40 mt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsPrescriptionModalOpen(false)}
                      disabled={isSubmittingPrescription}
                      className="text-[10px] cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="vital" 
                      size="sm" 
                      loading={isSubmittingPrescription}
                      disabled={isSubmittingPrescription}
                      className="text-[10px] cursor-pointer"
                    >
                      Sign & Issue Prescription
                    </Button>
                  </div>

                </form>
              </CardContent>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
