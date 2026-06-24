"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Phone, Star, Stethoscope, Briefcase, ChevronDown, ChevronUp, X, ShieldCheck, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DoctorListItem } from "@/features/doctors/actions/list-doctors";

const specialtyColors: Record<string, { bar: string; bg: string; text: string }> = {
  Cardiology:             { bar: "bg-health-red",     bg: "bg-health-red/10",     text: "text-health-red" },
  Dermatology:            { bar: "bg-health-orange",  bg: "bg-health-orange/10",  text: "text-health-orange" },
  Endocrinology:          { bar: "bg-purple-500",     bg: "bg-purple-500/10",     text: "text-purple-600" },
  Gastroenterology:       { bar: "bg-health-green",   bg: "bg-health-green/10",   text: "text-health-green" },
  Neurology:              { bar: "bg-health-blue",    bg: "bg-health-blue/10",    text: "text-health-blue" },
  "Infectious Diseases":  { bar: "bg-rose-500",       bg: "bg-rose-500/10",       text: "text-rose-600" },
  "Internal Medicine":    { bar: "bg-teal-500",       bg: "bg-teal-500/10",       text: "text-teal-600" },
  Pulmonology:            { bar: "bg-cyan-500",       bg: "bg-cyan-500/10",       text: "text-cyan-600" },
  Orthopedics:            { bar: "bg-amber-500",      bg: "bg-amber-500/10",      text: "text-amber-600" },
  "General Surgery":      { bar: "bg-slate-500",      bg: "bg-slate-500/10",      text: "text-slate-600" },
  "Vascular Surgery":     { bar: "bg-indigo-500",     bg: "bg-indigo-500/10",     text: "text-indigo-600" },
};

const defaultColor = { bar: "bg-health-blue", bg: "bg-health-blue/10", text: "text-health-blue" };

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-3 w-3 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/15"}`}
      />
    );
  }
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-[1px]">{stars}</div>
      {count > 0 ? (
        <span className="text-[10px] text-muted-foreground ml-1 font-medium">{rating.toFixed(1)} ({count})</span>
      ) : (
        <span className="text-[10px] text-muted-foreground ml-1">No reviews</span>
      )}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
} as const;

export function DoctorsClient({ doctors, specialties }: { doctors: DoctorListItem[]; specialties: string[] }) {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    toast.loading("Accessing browser location services...", { id: "geo-toast" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
        toast.success("Successfully synchronized location! Directory sorted by proximity.", { id: "geo-toast" });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access denied. Please enable location permissions in browser settings.";
        }
        toast.error(errorMsg, { id: "geo-toast" });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    toast.success("Location filter cleared. Directory reset to default order.");
  };

  const filtered = useMemo(() => {
    let list = doctors.map(d => {
      let distance: number | null = null;
      if (userCoords) {
        distance = calculateDistance(userCoords.latitude, userCoords.longitude, d.latitude, d.longitude);
      }
      return { ...d, distance };
    });

    list = list.filter(d => {
      const matchesSearch = !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        (d.address && d.address.toLowerCase().includes(search.toLowerCase()));
      const matchesSpecialty = !selectedSpecialty || d.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });

    if (userCoords) {
      list.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return list;
  }, [doctors, search, selectedSpecialty, userCoords]);

  const activeFilterCount = (search ? 1 : 0) + (selectedSpecialty ? 1 : 0) + (userCoords ? 1 : 0);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200 overflow-x-hidden">

      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden opacity-25 z-0">
        <div className="absolute -top-[15%] left-[5%] w-[40%] aspect-square rounded-full bg-radial from-health-blue/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute -top-[10%] right-[10%] w-[35%] aspect-square rounded-full bg-radial from-health-green/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold tracking-tight cursor-pointer">Æ</div>
            <span className="font-bold tracking-tight text-sm cursor-pointer">AegisHealth</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">Sign In</Link>
            <Button asChild size="sm" variant="vital" className="text-xs font-semibold cursor-pointer">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-health-blue">
              <Sparkles className="h-3 w-3" /> Specialist Directory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            Find a <span className="bg-gradient-to-r from-health-blue via-blue-500 to-indigo-600 bg-clip-text text-transparent">Specialist</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse {doctors.length} verified doctors across {specialties.length} specialties
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, specialty, or location..."
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant={userCoords ? "vital" : "outline"}
              size="sm"
              onClick={userCoords ? handleClearLocation : handleFindNearMe}
              disabled={isLocating}
              className="text-xs font-semibold cursor-pointer shrink-0 h-10 px-3 flex items-center gap-1.5 transition-all"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <MapPin className={`h-3.5 w-3.5 ${userCoords ? "text-white" : "text-health-blue"}`} />
              )}
              {userCoords ? "Clear Location" : "Find Near Me"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs font-semibold cursor-pointer shrink-0 h-10"
            >
              {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {activeFilterCount > 0 && <span className="ml-1">({activeFilterCount})</span>}
            </Button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialty("")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide cursor-pointer transition-all ${
                  !selectedSpecialty
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Specialties
              </button>
              {specialties.map(s => {
                const c = specialtyColors[s] || defaultColor;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSpecialty(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide cursor-pointer transition-all ${
                      selectedSpecialty === s
                        ? `${c.bg} ${c.text} shadow-xs`
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <Stethoscope className="h-14 w-14 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-sm">No doctors match your search criteria.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedSpecialty(""); }} className="mt-5 text-xs cursor-pointer">
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map(doc => {
              const c = specialtyColors[doc.specialty] || defaultColor;
              return (
                <motion.div key={doc.id} variants={cardVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <Card className="h-full border border-border/70 shadow-xs relative overflow-hidden group transition-shadow hover:shadow-sm">
                    <div className={`absolute top-0 left-0 w-full h-1 ${c.bar} transition-colors`} />
                    <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                      {/* Top section */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-bold text-sm text-foreground leading-tight group-hover:transition-colors">{doc.name}</h3>
                            <div className={`flex items-center gap-1 text-[11px] font-semibold ${c.text}`}>
                              <Stethoscope className="h-3 w-3 shrink-0" />
                              <span className="truncate">{doc.specialty}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 p-1.5 rounded-lg ${c.bg} ${c.text}`}>
                            <Stethoscope className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <StarRating rating={doc.averageRating} count={doc.ratingCount} />
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                            {doc.distance !== undefined && doc.distance !== null && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-health-blue/15 text-health-blue rounded font-bold text-[9px] shrink-0">
                                <MapPin className="h-2.5 w-2.5 fill-current" />
                                {doc.distance < 1 ? `${Math.round(doc.distance * 1000)}m` : `${doc.distance.toFixed(1)} km`}
                              </span>
                            )}
                            <span className="flex items-center gap-1 shrink-0">
                              <Briefcase className="h-3 w-3" />
                              {doc.experienceYears}y
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-muted-foreground border-t border-border/30 pt-3">
                          {doc.address && (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-health-blue/60" />
                              <span className="leading-snug">{doc.address}</span>
                            </div>
                          )}
                          {doc.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0 text-health-green/60" />
                              <a href={`tel:${doc.phone}`} className="hover:text-foreground transition-colors">{doc.phone}</a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio (expandable) */}
                      {doc.bio && (
                        <div className="pt-1 border-t border-border/30">
                          <button
                            onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {expandedId === doc.id ? "Show less" : "Show more"}
                            {expandedId === doc.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                          {expandedId === doc.id && (
                            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{doc.bio}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-muted/30 border border-border/80 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="h-4 w-4 text-health-blue" />
              All Specialists Verified
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Every doctor in our directory is verified for credentials and licensing. Book consultations with confidence.
            </p>
          </div>
          <Button asChild variant="outline" className="text-xs font-semibold cursor-pointer shrink-0">
            <Link href="/register">
              Register as Patient <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 mt-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground sm:px-6">
          <p>© 2026 AegisHealthAI | AI Disease Prediction and Doctor Recommendation System</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground">Specialist Access</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-foreground">Patient Registry</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
