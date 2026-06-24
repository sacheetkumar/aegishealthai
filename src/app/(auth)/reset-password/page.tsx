"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { resetPassword } from "@/features/auth-shared/actions/reset-password-action";
import { AlertCircle, CheckCircle2, Lock, ArrowLeft, RefreshCw } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({
        email,
        token,
        password,
      });

      if (!result.success) {
        setError(result.error || "Failed to reset password.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch {
      setError("An unexpected error occurred during password update.");
    } finally {
      setIsLoading(false);
    }
  };

  const isParametersMissing = !token || !email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-[420px] space-y-6">
        
        {/* Brand Logo and Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
            Æ
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Update Password
          </h1>
          <p className="text-xs text-muted-foreground">
            Establish your new clinical vault security key
          </p>
        </div>

        {/* Card Form */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Reset Password</CardTitle>
            <CardDescription className="text-xs">
              Complete the security validation to finalize your credentials update.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Missing link arguments warning */}
            {isParametersMissing && (
              <div className="p-3 bg-health-red/10 text-health-red rounded-lg border border-health-red/20 flex flex-col gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Invalid or broken reset link. The token identifier or email query parameters are missing.</span>
                </div>
                <Link href="/forgot-password" className="text-health-blue hover:underline font-semibold block">
                  Request a new recovery link
                </Link>
              </div>
            )}

            {/* Error alerts */}
            {!isParametersMissing && error && (
              <div className="p-3 bg-health-red/10 text-health-red rounded-lg border border-health-red/20 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success state */}
            {success && (
              <div className="p-4 bg-health-green/10 text-health-green rounded-lg border border-health-green/20 flex flex-col items-center text-center gap-2 text-xs">
                <CheckCircle2 className="h-8 w-8 text-health-green" />
                <span className="font-semibold text-sm">Password Updated!</span>
                <p className="text-muted-foreground text-[11px]">
                  Your credentials have been successfully updated. Redirecting you to sign in...
                </p>
              </div>
            )}

            {/* Password input fields */}
            {!isParametersMissing && !success && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                <div className="space-y-1">
                  <label htmlFor="emailDisplay" className="text-xs font-semibold text-muted-foreground">
                    Resetting Password For
                  </label>
                  <input
                    id="emailDisplay"
                    type="text"
                    disabled
                    value={email}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground cursor-not-allowed opacity-80"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                    New Password
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

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                <Button
                  variant="vital"
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full text-xs font-semibold mt-4 cursor-pointer"
                >
                  Reset Password <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </form>
            )}

          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 bg-muted/10 py-3 rounded-b-xl">
            <Link 
              href="/login" 
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
