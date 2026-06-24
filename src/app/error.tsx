"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route segment error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        System Encountered an Error
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        We encountered an error while processing your request. This has been logged and is being monitored.
      </p>
      {error.digest && (
        <code className="mt-4 px-2 py-1 bg-muted rounded border border-border text-xs font-mono text-muted-foreground">
          Error ID: {error.digest}
        </code>
      )}
      <div className="flex flex-row items-center gap-3 mt-6">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg shadow-xs hover:bg-muted transition-all"
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
