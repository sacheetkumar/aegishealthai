"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requestPasswordReset } from "@/features/auth-shared/actions/reset-password-action";
import { AlertCircle, CheckCircle2, Mail, ArrowLeft, RefreshCw } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        setError(result.error || "Failed to submit request.");
      } else {
        setSuccessMessage(result.message || "A recovery link has been generated.");
      }
    } catch {
      setError("An unexpected error occurred during password recovery.");
    } finally {
      setIsLoading(false);
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
            Recover Password
          </h1>
          <p className="text-xs text-muted-foreground">
            Regain access to your secure health account
          </p>
        </div>

        {/* Card Form */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Password Recovery</CardTitle>
            <CardDescription className="text-xs">
              Provide your account email to receive a recovery token.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Error state */}
            {error && (
              <div className="p-3 bg-health-red/10 text-health-red rounded-lg border border-health-red/20 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success state */}
            {successMessage && (
              <div className="p-4 bg-health-green/10 text-health-green rounded-lg border border-health-green/20 flex flex-col items-center text-center gap-2 text-xs">
                <CheckCircle2 className="h-8 w-8 text-health-green" />
                <span className="font-semibold text-sm">Reset Link Generated!</span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {successMessage}
                </p>
                <div className="mt-3 p-2.5 bg-background rounded-lg border border-border/80 text-[10px] text-left text-muted-foreground w-full font-mono">
                  <span className="font-bold text-foreground block mb-1">Developer Notice:</span>
                  Check your Node.js server terminal logs to grab the generated password reset link!
                </div>
              </div>
            )}

            {!successMessage && (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="doctor@aegishealth.ai"
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
                  className="w-full text-xs font-semibold cursor-pointer"
                >
                  Send Recovery Link <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
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
