import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: (session.user.role as "PATIENT" | "DOCTOR" | "ADMIN") || "PATIENT",
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
