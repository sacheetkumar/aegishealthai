"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, Heart, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200 overflow-x-hidden relative">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute -top-[20%] left-[10%] w-[45%] aspect-square rounded-full bg-radial from-health-blue/15 to-transparent blur-3xl" />
        <div className="absolute -top-[10%] right-[15%] w-[40%] aspect-square rounded-full bg-radial from-health-green/10 to-transparent blur-3xl" />
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md relative z-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold tracking-tight transition-transform group-hover:scale-105">
              Æ
            </div>
            <span className="font-bold tracking-tight text-sm sm:text-base">AegisHealth</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-border" />
            <Button asChild size="sm" variant="outline" className="text-xs font-semibold cursor-pointer">
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        
        {/* Page Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-health-blue/10 border border-health-blue/20 text-xs font-semibold text-health-blue">
            <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
            Clinical Data Privacy Framework
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
            Privacy & Trust Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Effective Date: June 20, 2026. This policy describes how AegisHealthAI secures, encrypts, and processes your clinical metrics and health records.
          </p>
        </div>

        {/* Highlight Cards Grid */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="p-5 bg-card border border-border/80 rounded-xl space-y-2.5 shadow-sm">
            <span className="p-2 bg-health-blue/10 text-health-blue rounded-lg inline-block">
              <Lock className="h-4 w-4" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Military-Grade Encryption</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              All data inputs are encrypted using AES-256 standard keys at-rest and SHA-256 SSL protocols in-transit.
            </p>
          </div>

          <div className="p-5 bg-card border border-border/80 rounded-xl space-y-2.5 shadow-sm">
            <span className="p-2 bg-health-green/10 text-health-green rounded-lg inline-block">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Secure Health Vault</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Electronic Health Records integrations fully comply with protected health information rules.
            </p>
          </div>

          <div className="p-5 bg-card border border-border/80 rounded-xl space-y-2.5 shadow-sm">
            <span className="p-2 bg-purple-500/10 text-purple-600 rounded-lg inline-block">
              <Eye className="h-4 w-4" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Zero Third-Party Sharing</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Your clinical data and diagnostic simulations are never rented, sold, or shared with advertisers or unapproved providers.
            </p>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="space-y-8 bg-muted/20 border border-border/80 rounded-2xl p-6 sm:p-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
              <FileText className="h-4 w-4 text-health-blue" />
              1. Information Collection and Health Data
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We collect parameters voluntarily submitted during registration and diagnostic simulations, as well as synchronizations from wearable devices (like heart rate, blood pressure, fasting glucose, and step data). This data is isolated inside your personal patient dashboard.
            </p>
          </div>

          <div className="h-[1px] bg-border/40" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
              <Lock className="h-4 w-4 text-health-blue" />
              2. Data Protection and Access Controls
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Only authorized practitioners credentials matched to your specific care schedule are granted decrypted access to your health profile. Administrative oversight actions are logged to permanent audit trails to prevent credential abuses.
            </p>
            <div className="p-3 bg-health-green/5 border border-health-green/20 rounded-lg text-[10px] text-muted-foreground flex gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 text-health-green shrink-0 mt-0.5" />
              <span>
                <strong>Compliance Standard:</strong> AegisHealthAI is regularly audited under SOC2 Type II and standard healthcare security guidelines.
              </span>
            </div>
          </div>

          <div className="h-[1px] bg-border/40" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
              <Heart className="h-4 w-4 text-health-blue" />
              3. AI Diagnosis and Clinical Advice Disclaimer
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The machine learning model outputs (like Random Forest/XGBoost simulated prognoses) presented inside the sandbox or patient dashboard are statistical estimates intended to assist decision workflows. They do not constitute official medical diagnoses or professional clinical prescriptions.
            </p>
          </div>

          <div className="h-[1px] bg-border/40" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-health-blue" />
              4. Patient Consent and Right to Erasure
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Under compliance standards, patients can revoke consent at any time. Revoking consent prompts immediate cryptographic deletion of all personal history entries and health parameters from our live storage systems.
            </p>
          </div>

        </section>

        {/* Contact/Support Footer Section */}
        <section className="text-center py-6 border-t border-border/40 space-y-4">
          <p className="text-xs text-muted-foreground">
            Have questions regarding compliance specifications or secure record transfers?
          </p>
          <Button asChild size="sm" variant="vital" className="text-xs font-semibold cursor-pointer">
            <Link href="mailto:security@aegishealth.ai">
              Contact Compliance Office
            </Link>
          </Button>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 mt-20 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground sm:px-6">
          <p>© 2026 AegisHealthAI Inc. Protected under clinical data privacy and secure encryption guidelines.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground">Home Page</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground">Clinician Access</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-foreground">Patient Registry</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
