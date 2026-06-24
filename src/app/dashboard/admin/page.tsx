import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/features/admin/components/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Enforce ADMIN role-based access control restriction
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all user registrations from the PostgreSQL database
  const dbUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Convert role to matches expected client model type
  const users = dbUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "PATIENT" | "DOCTOR" | "ADMIN",
    createdAt: u.createdAt,
  }));

  const user = {
    name: session.user.name,
    email: session.user.email,
  };

  return <AdminDashboardClient user={user} users={users} />;
}
