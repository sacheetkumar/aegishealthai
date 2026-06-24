"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { updateUserRole } from "../actions/update-user-role";
import { Skeleton } from "@/components/feedback/skeleton";
import { 
  Users, 
  ShieldAlert, 
  Activity,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Cpu
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  createdAt: Date;
}

interface AdminDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  users: AdminUser[];
}

export function AdminDashboardClient({ user, users: initialUsers }: AdminDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const adminName = user.name || "Administrator";

  // Mock latency data logs (daily latency response times)
  const latencyData = [
    { name: "06-05", p95: 140, p99: 220 },
    { name: "06-06", p95: 125, p99: 195 },
    { name: "06-07", p95: 155, p99: 240 },
    { name: "06-08", p95: 130, p99: 210 },
    { name: "06-09", p95: 110, p99: 180 },
    { name: "06-10", p95: 115, p99: 190 },
    { name: "06-11", p95: 120, p99: 195 },
  ];

  const handleRoleChange = async (userId: string, newRole: "PATIENT" | "DOCTOR" | "ADMIN") => {
    setUpdatingId(userId);
    toast.loading("Updating authorization clearances in database...", { id: "role-toast" });

    try {
      const res = await updateUserRole(userId, newRole);
      
      if (res.success) {
        // Update local state
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`Role updated to ${newRole} successfully!`, {
          id: "role-toast",
          description: "Permissions updated. Session flags will refresh on user's next request."
        });
      } else {
        toast.error(res.error || "Failed to update user authorization clearances.", { id: "role-toast" });
      }
    } catch {
      toast.error("An unexpected error occurred during database modification.", { id: "role-toast" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } }
  } as const;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-health-red animate-pulse" />
            Security Operations Center
          </h1>
          <p className="text-xs text-muted-foreground">
            Active security administrator session: <span className="font-semibold text-foreground">{adminName}</span> • Database State: <span className="text-health-green font-semibold">ALL SYSTEMS COMPLIANT</span>
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 1200)),
              {
                loading: "Performing network latency audits...",
                success: "All 3 platform edge nodes reporting clear health configurations.",
                error: "Audit failed."
              }
            );
          }}
          className="text-[10px] h-8 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Audit Platform Edge
        </Button>
      </div>

      {/* Overview Count cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="p-2.5 bg-health-blue/10 text-health-blue rounded-lg">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Registered Accounts</p>
                <p className="text-xl font-bold tracking-tight mt-0.5">{users.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="p-2.5 bg-health-red/10 text-health-red rounded-lg">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Audit Failures</p>
                <p className="text-xl font-bold tracking-tight mt-0.5">0</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="p-2.5 bg-health-green/10 text-health-green rounded-lg">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">API Node Health</p>
                <p className="text-xl font-bold tracking-tight mt-0.5">100%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main content grid splitter */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* User Account Registry list */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">User Access Registry</CardTitle>
                <CardDescription className="text-xs">Manage authentication identities and role clearances.</CardDescription>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="h-8 px-2 text-[10px] font-semibold rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="PATIENT">Patients</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <div className="relative flex items-center max-w-xs w-full">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name/email..."
                    className="w-full h-8 pl-8 pr-3 text-[10px] rounded-lg border border-border bg-background/50 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium bg-muted/20">
                    <th className="py-2.5 px-4">Account Name</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Clearance Role</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {u.name || "Unnamed User"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold border text-[9px] ${
                            u.role === "ADMIN" 
                              ? "bg-health-red/10 text-health-red border-health-red/20"
                              : u.role === "DOCTOR"
                              ? "bg-health-blue/10 text-health-blue border-health-blue/20"
                              : "bg-health-green/10 text-health-green border-health-green/20"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {["PATIENT", "DOCTOR", "ADMIN"].map((r) => {
                            const isCurrent = u.role === r;
                            return (
                              <button
                                key={r}
                                disabled={isCurrent || updatingId === u.id}
                                onClick={() => handleRoleChange(u.id, r as "PATIENT" | "DOCTOR" | "ADMIN")}
                                className={`px-2 py-1 rounded text-[9px] font-semibold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isCurrent 
                                    ? "bg-primary text-primary-foreground border-primary" 
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {updatingId === u.id && !isCurrent ? (
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin inline" />
                                ) : (
                                  r.substring(0, 3)
                                )}
                              </button>
                            );
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                        No registered users match the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right column sidebar analytics charts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-health-red" />
                API Response Latency
              </CardTitle>
              <CardDescription className="text-[10px]">95th & 99th percentile response latencies (ms).</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] pt-3">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={9} stroke="#888888" tickLine={false} />
                    <YAxis fontSize={9} stroke="#888888" tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "6px" }} />
                    <Legend wrapperStyle={{ fontSize: "9px" }} />
                    <Bar dataKey="p95" fill="#3b82f6" name="p95 Latency" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="p99" fill="#ef4444" name="p99 Latency" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full animate-pulse" />
              )}
            </CardContent>
          </Card>

          {/* Audit parameters */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ops Log Center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2 p-2 bg-muted/30 border border-border/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-health-green shrink-0" />
                <span>Security audit logs active. Compliance audits scheduled for nightly backup.</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 border border-border/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-health-orange shrink-0" />
                <span>Simulated database server running over mock parameters. Configure environment secrets in production.</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
