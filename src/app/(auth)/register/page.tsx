"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerUser, isGoogleConfigured } from "@/features/auth-shared/actions/register-action";
import { AlertCircle, CheckCircle2, User, Stethoscope, Mail, Lock, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    isGoogleConfigured().then(setGoogleAvailable);
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsOAuthLoading(true);
    try {
      const configured = await isGoogleConfigured();
      if (configured) {
        await signIn("google", { callbackUrl: "/dashboard" });
      } else {
        setError("Google sign-up is not available. Please register with email and password.");
        setIsOAuthLoading(false);
      }
    } catch {
      setError("Failed to initiate Google sign-up. Please try again.");
      setIsOAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await registerUser({
        name,
        email,
        password,
        role,
        specialty: role === "DOCTOR" ? specialty : undefined,
        licenseNumber: role === "DOCTOR" ? licenseNumber : undefined,
        mobileNumber: role === "DOCTOR" ? mobileNumber : undefined,
        clinicPhone: role === "DOCTOR" ? clinicPhone : undefined,
        address: role === "DOCTOR" ? address : undefined,
      });

      if (!result.success) {
        setError(result.error || "An error occurred during registration.");
      } else {
        setSuccess(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch {
      setError("An unexpected registration error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-[450px] space-y-6">
        
        {/* Brand Logo and Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
            Æ
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Create your AegisHealth Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Join the clinical network securely in minutes
          </p>
        </div>

        {/* Card Form */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Get Started</CardTitle>
            <CardDescription className="text-xs">
              Select your role type to set up profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Success state */}
            {success && (
              <div className="p-4 bg-health-green/10 text-health-green rounded-lg border border-health-green/20 flex flex-col items-center text-center gap-2 text-xs">
                <CheckCircle2 className="h-8 w-8 text-health-green animate-bounce" />
                <span className="font-semibold text-sm">Account Created Successfully!</span>
                <span>Redirecting you to the sign in portal...</span>
              </div>
            )}

            {!success && (
              <>
                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-health-red/10 text-health-red rounded-lg border border-health-red/20 flex items-start gap-2 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Role Switch Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setRole("PATIENT")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                      role === "PATIENT"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Patient Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("DOCTOR")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                      role === "DOCTOR"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    Doctor Portal
                  </button>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  
                  {/* Common Fields */}
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        disabled={isLoading}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        disabled={isLoading}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                      Password (min 6 chars)
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {/* Doctor Fields */}
                  {role === "DOCTOR" && (
                    <div className="pt-2 border-t border-dashed border-border/80 space-y-3">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Medical Practitioner Info
                      </p>
                      
                      <div className="space-y-1">
                        <label htmlFor="specialty" className="text-xs font-semibold text-muted-foreground">
                          Medical Speciality
                        </label>
                        <input
                          id="specialty"
                          type="text"
                          required
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          placeholder="Cardiology / Internal Medicine"
                          disabled={isLoading}
                          className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="license" className="text-xs font-semibold text-muted-foreground">
                          Medical License Number
                        </label>
                        <input
                          id="license"
                          type="text"
                          required
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder="LIC-12345-US"
                          disabled={isLoading}
                          className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="mobileNumber" className="text-xs font-semibold text-muted-foreground">
                          Doctor's Mobile Number
                        </label>
                        <input
                          id="mobileNumber"
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          disabled={isLoading}
                          className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="clinicPhone" className="text-xs font-semibold text-muted-foreground">
                          Clinic's Phone Number
                        </label>
                        <input
                          id="clinicPhone"
                          type="text"
                          required
                          value={clinicPhone}
                          onChange={(e) => setClinicPhone(e.target.value)}
                          placeholder="+91 11 4567 8901"
                          disabled={isLoading}
                          className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="address" className="text-xs font-semibold text-muted-foreground">
                          Clinic Address
                        </label>
                        <textarea
                          id="address"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Max Hospital, Saket, New Delhi - 110017"
                          disabled={isLoading}
                          className="w-full text-xs p-3 rounded-lg border border-border bg-background/50 h-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60 resize-none font-sans"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    variant="vital"
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading || isOAuthLoading}
                    className="w-full text-xs font-semibold mt-4 cursor-pointer"
                  >
                    Register Profile <UserPlus className="h-4 w-4" />
                  </Button>
                </form>

                {/* Google OAuth */}
                {googleAvailable && (
                  <>
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-border/80"></div>
                      <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        or continue with
                      </span>
                      <div className="flex-grow border-t border-border/80"></div>
                    </div>

                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleGoogleLogin}
                      loading={isOAuthLoading}
                      disabled={isLoading || isOAuthLoading}
                      className="w-full text-xs font-semibold bg-background hover:bg-muted cursor-pointer"
                    >
                      {!isOAuthLoading && (
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <g transform="matrix(1, 0, 0, 1, 0, 0)">
                            <path d="M21.35,11.1H12v2.7h5.38C16.88,16.5,14.77,18,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.47,0,2.82,0.53,3.87,1.42l2.02-2.02C16.14,3.75,14.18,3,12,3C7.03,3,3,7.03,3,12s4.03,9,9,9c4.75,0,8-3.3,8-8C20,12.4,19.8,11.8,19.35,11.1Z" fill="currentColor"></path>
                          </g>
                        </svg>
                      )}
                      Sign up with Google
                    </Button>
                  </>
                )}
              </>
            )}

          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/10 py-3 rounded-b-xl">
            <span className="text-sm text-muted-foreground text-[11px]">
              Already have a clinical account?{" "}
              <Link 
                href="/login" 
                className="font-semibold text-health-blue hover:underline cursor-pointer"
              >
                Sign in
              </Link>
            </span>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
