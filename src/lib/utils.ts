import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard utility for merging Tailwind CSS classes dynamically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats blood pressure numbers into the clinical "Systolic/Diastolic" notation.
 */
export function formatBloodPressure(systolic: number, diastolic: number): string {
  return `${Math.round(systolic)}/${Math.round(diastolic)}`;
}

/**
 * Formats a heart rate value.
 */
export function formatHeartRate(bpm: number): string {
  return `${Math.round(bpm)} bpm`;
}

/**
 * Formats blood glucose levels.
 */
export function formatBloodGlucose(mgdl: number): string {
  return `${Math.round(mgdl)} mg/dL`;
}

/**
 * Formats weight measurements.
 */
export function formatWeight(kg: number, system: "metric" | "imperial" = "metric"): string {
  if (system === "imperial") {
    const lbs = kg * 2.20462;
    return `${lbs.toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

/**
 * Formats date to a clean, readable clinical view (e.g. "Oct 24, 2026").
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats date and time for appointments (e.g. "Oct 24, 2026 at 2:30 PM").
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return `${formatDate(d)} at ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

/**
 * Evaluates clinical metrics against reference ranges to determine visual state.
 */
export function getMetricStatus(
  type: "HEART_RATE" | "BLOOD_PRESSURE_SYSTOLIC" | "BLOOD_GLUCOSE" | "STEPS",
  value: number
): {
  label: "Normal" | "Warning" | "Critical" | "Optimal";
  colorClass: string;
  bgClass: string;
} {
  switch (type) {
    case "HEART_RATE":
      if (value < 60 || value > 100) {
        return { label: "Warning", colorClass: "text-health-orange", bgClass: "bg-health-orange/10" };
      }
      return { label: "Normal", colorClass: "text-health-green", bgClass: "bg-health-green/10" };

    case "BLOOD_PRESSURE_SYSTOLIC":
      if (value >= 140) {
        return { label: "Critical", colorClass: "text-health-red", bgClass: "bg-health-red/10" };
      }
      if (value >= 120) {
        return { label: "Warning", colorClass: "text-health-orange", bgClass: "bg-health-orange/10" };
      }
      return { label: "Normal", colorClass: "text-health-green", bgClass: "bg-health-green/10" };

    case "BLOOD_GLUCOSE":
      if (value >= 126 || value < 70) {
        return { label: "Critical", colorClass: "text-health-red", bgClass: "bg-health-red/10" };
      }
      if (value >= 100) {
        return { label: "Warning", colorClass: "text-health-orange", bgClass: "bg-health-orange/10" };
      }
      return { label: "Normal", colorClass: "text-health-green", bgClass: "bg-health-green/10" };

    case "STEPS":
      if (value >= 10000) {
        return { label: "Optimal", colorClass: "text-health-blue", bgClass: "bg-health-blue/10" };
      }
      if (value >= 5000) {
        return { label: "Normal", colorClass: "text-health-green", bgClass: "bg-health-green/10" };
      }
      return { label: "Warning", colorClass: "text-muted-foreground", bgClass: "bg-muted" };
  }
}
