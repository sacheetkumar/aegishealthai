"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting for client-side mounting
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return compact ? (
      <div className="h-8 w-8 rounded-lg border border-border bg-muted/20 opacity-50 animate-pulse" />
    ) : (
      <div className="flex h-9 w-28 items-center justify-between rounded-lg border border-border bg-muted/20 p-1 opacity-50">
        <div className="h-7 w-8 rounded-md bg-transparent" />
        <div className="h-7 w-8 rounded-md bg-transparent" />
        <div className="h-7 w-8 rounded-md bg-transparent" />
      </div>
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Laptop, label: "System" },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  const handleCycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleCycleTheme}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title={`Theme: ${currentTheme.label} (Click to change)`}
        aria-label={`Theme: ${currentTheme.label} (Click to change)`}
      >
        <CurrentIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/20 p-1 transition-all duration-200 hover:border-border/80">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "relative flex h-7 w-8 items-center justify-center rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
              isActive && "bg-background text-foreground shadow-sm scale-102"
            )}
            title={`${label} Mode`}
            aria-label={`${label} Mode`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
