"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      theme={theme as "light" | "dark" | "system"}
      closeButton
      richColors
      toastOptions={{
        className: "font-sans border border-border shadow-md rounded-xl text-xs px-4 py-3 bg-card text-card-foreground",
      }}
    />
  );
}
