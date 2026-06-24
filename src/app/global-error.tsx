"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center antialiased font-sans">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          AegisHealthAI Crash
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-lg">
          A critical system error occurred that prevented the application root layout from loading.
        </p>
        {error.digest && (
          <code className="mt-4 px-2 py-1 bg-muted rounded border border-border text-xs font-mono text-muted-foreground">
            Crash Digest: {error.digest}
          </code>
        )}
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 mt-8 text-sm font-semibold text-primary-foreground bg-primary rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Reboot Platform
        </button>
      </body>
    </html>
  );
}
