"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, Lock, Mail, ArrowRight, User, Stethoscope } from "lucide-react";
import { isGoogleConfigured } from "@/features/auth-shared/actions/register-action";

type AuthRole = "patient" | "doctor";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [role, setRole] = useState<AuthRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isGoogleConfigured().then(setGoogleAvailable);
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password combination. Please try again.");
      } else {
        router.push(result?.url || callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsOAuthLoading(true);
    try {
      const configured = await isGoogleConfigured();
      if (configured) {
        await signIn("google", { callbackUrl });
      } else {
        setError("Google sign-in is not available. Please use email and password to sign in.");
        setIsOAuthLoading(false);
      }
    } catch {
      setError("Failed to initiate Google sign-in. Please try again.");
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-[420px] space-y-6">
        
        {/* Brand Logo and Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
            Æ
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Sign in to AegisHealth
          </h1>
          <p className="text-xs text-muted-foreground">
            Clinical intelligence & secure health records
          </p>
        </div>

        {/* Login Card wrapper */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            {/* Role Toggle */}
            <div className="flex bg-muted/60 rounded-lg p-0.5 mb-3">
              <button
                type="button"
                onClick={() => { setRole("patient"); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold h-8 rounded-md transition-all cursor-pointer ${
                  role === "patient"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => { setRole("doctor"); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold h-8 rounded-md transition-all cursor-pointer ${
                  role === "doctor"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Doctor
              </button>
            </div>
            <CardTitle className="text-base font-semibold">
              {role === "patient" ? "Patient Sign In" : "Doctor Sign In"}
            </CardTitle>
            <CardDescription className="text-xs">
              {role === "patient"
                ? "Access your personal health records and clinical insights."
                : "Securely access patient records and diagnostic tools."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Error alerts */}
            {error && (
              <div className="p-3 bg-health-red/10 text-health-red rounded-lg border border-health-red/20 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
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
                    placeholder={role === "patient" ? "patient@aegishealth.ai" : "doctor@aegishealth.ai"}
                    disabled={isLoading || isOAuthLoading}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[11px] font-semibold text-health-blue hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading || isOAuthLoading}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <Button
                variant="vital"
                type="submit"
                loading={isLoading}
                disabled={isLoading || isOAuthLoading}
                className="w-full text-xs font-semibold cursor-pointer"
              >
                {role === "patient" ? "Sign In as Patient" : "Sign In as Doctor"}
                <ArrowRight className="h-3.5 w-3.5" />
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
                  Sign in with Google
                </Button>
              </>
            )}

          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/10 py-3 rounded-b-xl">
            <span className="text-[11px] text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link 
                href="/register" 
                className="font-semibold text-health-blue hover:underline cursor-pointer"
              >
                Sign up
              </Link>
            </span>
          </CardFooter>
        </Card>

        {/* Security Disclaimer Footer */}
        <p className="text-[10px] text-center text-muted-foreground">
          Protected under clinical data privacy guidelines. Encrypted SSL token handshakes active.
        </p>

      </div>
    </div>
  );
}
