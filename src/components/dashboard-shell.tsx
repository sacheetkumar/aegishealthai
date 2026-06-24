"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Activity, 
  Calendar, 
  ShieldAlert, 
  Stethoscope,
  Brain,
  FileText,
  Sparkles,
  Clock,
  Phone,
  User,
  Settings
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Health Analysis": true,
    "Doctors": true,
    "Medical Records": true,
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  // Resolve sidebar items based on role
  const getSidebarItems = (): SidebarItem[] => {
    const common = [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }];
    
    switch (user.role) {
      case "PATIENT":
        return [
          ...common,
          { label: "Vitals & Vitals", href: "/dashboard/patient", icon: Activity },
          { label: "AI Diagnosis", href: "/dashboard/patient/prediction", icon: Brain },
          { label: "Prescription Scan", href: "/dashboard/patient/ocr", icon: FileText },
          { label: "Care Visits", href: "/dashboard/patient#appointments", icon: Calendar },
        ];
      case "DOCTOR":
        return [
          ...common,
          { label: "Doctor Portal", href: "/dashboard/doctor", icon: Stethoscope },
        ];
      case "ADMIN":
        return [
          ...common,
          { label: "Patient View", href: "/dashboard/patient", icon: Activity },
          { label: "Clinical Queue", href: "/dashboard/doctor", icon: Stethoscope },
          { label: "Ops Center", href: "/dashboard/admin", icon: ShieldAlert },
        ];
      default:
        return common;
    }
  };

  const menuItems = getSidebarItems();

  const patientMenu = [
    { label: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    {
      label: "Health Analysis",
      icon: Activity,
      subItems: [
        { label: "Symptom Assessment", href: "/dashboard/patient/prediction" },
        { label: "Prediction History", href: "/dashboard/patient", tab: "prediction-history" },
        { label: "Health Insights", href: "/dashboard/patient", tab: "health-insights" },
      ],
    },
    {
      label: "Doctors",
      icon: Stethoscope,
      subItems: [
        { label: "Recommended Specialists", href: "/dashboard/patient", tab: "recommended-specialists" },
        { label: "Appointments", href: "/dashboard/patient", tab: "appointments" },
      ],
    },
    {
      label: "Medical Records",
      icon: FileText,
      subItems: [
        { label: "Upload Reports", href: "/dashboard/patient/ocr" },
        { label: "Prescriptions", href: "/dashboard/patient", tab: "prescriptions" },
      ],
    },
    { label: "AI Assistant", href: "/dashboard/patient", tab: "ai-assistant", icon: Sparkles },
    { label: "Medication Reminder", href: "/dashboard/patient", tab: "medication-reminders", icon: Clock },
    { label: "Emergency Contacts", href: "/dashboard/patient", tab: "emergency-contacts", icon: Phone },
    { label: "Profile", href: "/dashboard/patient", tab: "profile", icon: User },
    { label: "Settings", href: "/dashboard/patient", tab: "settings", icon: Settings },
  ];

  const renderPatientMenuItem = (item: any, index: number, isMobile = false) => {
    const Icon = item.icon;
    const hasSubItems = !!item.subItems;
    
    let isActive = false;
    if (!hasSubItems) {
      const activeTab = searchParams.get("tab");
      if (item.tab) {
        isActive = pathname === item.href && activeTab === item.tab;
      } else {
        isActive = pathname === item.href && !activeTab;
      }
    } else {
      isActive = item.subItems.some((sub: any) => {
        const activeTab = searchParams.get("tab");
        if (sub.tab) {
          return pathname === sub.href && activeTab === sub.tab;
        } else {
          return pathname === sub.href && !activeTab;
        }
      });
    }

    const itemUrl = item.tab ? `${item.href}?tab=${item.tab}` : item.href;

    if (!hasSubItems) {
      return (
        <Link 
          key={item.label} 
          href={itemUrl} 
          onClick={() => isMobile && setIsMobileOpen(false)}
        >
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer relative group transition-colors duration-150 ${
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="absolute inset-0 bg-primary/5 rounded-lg border-l-2 border-primary"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              />
            )}
            {Icon && <Icon className={`h-4 w-4 shrink-0 z-10 transition-transform ${isActive ? "text-primary scale-110" : "group-hover:scale-105"}`} />}
            
            {(!isCollapsed || isMobile) && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="z-10 truncate"
              >
                {item.label}
              </motion.span>
            )}

            {isCollapsed && !isMobile && (
              <div className="absolute left-14 hidden group-hover:block bg-popover text-popover-foreground text-[10px] font-semibold px-2 py-1 rounded shadow border border-border z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </div>
        </Link>
      );
    }

    const isOpen = expandedSections[item.label];

    return (
      <div key={item.label} className="space-y-1">
        <div
          onClick={() => toggleSection(item.label)}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150`}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {(!isCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
          </div>
          {(!isCollapsed || isMobile) && (
            <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
          )}
        </div>

        {isOpen && (!isCollapsed || isMobile) && (
          <div className="pl-6 space-y-1 border-l border-border/50 ml-5">
            {item.subItems.map((sub: any) => {
              const subActiveTab = searchParams.get("tab");
              const isSubActive = sub.tab 
                ? pathname === sub.href && subActiveTab === sub.tab
                : pathname === sub.href && !subActiveTab;
              const subUrl = sub.tab ? `${sub.href}?tab=${sub.tab}` : sub.href;

              return (
                <Link 
                  key={sub.label} 
                  href={subUrl}
                  onClick={() => isMobile && setIsMobileOpen(false)}
                >
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                      isSubActive 
                        ? "text-primary bg-primary/5 font-bold" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <span>{sub.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const getDesktopSidebarContent = () => {
    if (user.role === "PATIENT") {
      return patientMenu.map((item, idx) => renderPatientMenuItem(item, idx, false));
    }
    return menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      return (
        <Link key={item.label} href={item.href}>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer relative group transition-colors duration-150 ${
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="absolute inset-0 bg-primary/5 rounded-lg border-l-2 border-primary"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              />
            )}
            <Icon className={`h-4 w-4 shrink-0 z-10 transition-transform ${isActive ? "text-primary scale-110" : "group-hover:scale-105"}`} />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="z-10 truncate"
              >
                {item.label}
              </motion.span>
            )}
            {isCollapsed && (
              <div className="absolute left-14 hidden group-hover:block bg-popover text-popover-foreground text-[10px] font-semibold px-2 py-1 rounded shadow border border-border z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </div>
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex transition-colors duration-200">
      
      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden md:flex flex-col border-r border-border bg-card sticky top-0 h-screen z-30 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Sidebar Header */}
        <div className={`flex h-14 items-center border-b border-border/80 relative ${
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        }`}>
          <Link href="/" className="flex items-center gap-2 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold tracking-tight">
              Æ
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-bold tracking-tight text-sm flex items-center"
              >
                <span>AegisHealth</span>
              </motion.div>
            )}
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-muted-foreground hover:text-foreground hidden md:flex items-center justify-center z-50 cursor-pointer ${
              isCollapsed 
                ? "absolute -right-3 top-3.5 h-6 w-6 rounded-full border border-border bg-card shadow-sm" 
                : "h-7 w-7"
            }`}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {getDesktopSidebarContent()}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-border bg-muted/10 space-y-2">
          {/* User badge */}
          <div className={`flex items-center gap-3 p-2 rounded-lg ${isCollapsed ? "justify-center" : ""}`}>
            <div className="h-7 w-7 rounded-full bg-health-blue text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.name || "Aegis User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.role}</p>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className={`flex items-center gap-2 justify-between ${isCollapsed ? "flex-col" : "flex-row px-1"}`}>
            <ThemeToggle compact={isCollapsed} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              loading={isSigningOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
              title="Sign Out"
            >
              {!isSigningOut && <LogOut className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Drawer Slide-out Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Sidebar content drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col p-4 md:hidden shadow-xl"
            >
              <div className="flex h-10 items-center justify-between border-b border-border/80 pb-3 mb-4">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    Æ
                  </div>
                  <span className="font-bold tracking-tight text-sm">AegisHealth</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                {user.role === "PATIENT" ? (
                  patientMenu.map((item, idx) => renderPatientMenuItem(item, idx, true))
                ) : (
                  menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.label} href={item.href} onClick={() => setIsMobileOpen(false)}>
                        <div
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                            isActive 
                              ? "bg-primary/5 text-primary border-l-2 border-primary" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </nav>

              <div className="border-t border-border pt-4 bg-muted/5 space-y-2 mt-auto">
                <div className="flex items-center gap-3 p-1">
                  <div className="h-8 w-8 rounded-full bg-health-blue text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user.name || "Aegis User"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    loading={isSigningOut}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                  >
                    {!isSigningOut && <LogOut className="h-3.5 w-3.5" />} Sign Out
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Scaffold Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="font-bold tracking-tight text-xs flex items-center hover:opacity-90 transition-opacity cursor-pointer">
              AegisHealth
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-health-blue text-white flex items-center justify-center text-xs font-bold">
              {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
            </div>
          </div>
        </header>

        {/* Scaffold Content Area */}
        <main className="flex-1 relative overflow-x-hidden focus:outline-none">
          {children}
        </main>
      </div>

    </div>
  );
}
