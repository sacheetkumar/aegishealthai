import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await auth();

  // Middleware should catch this, but safeguard redirect anyway
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "DOCTOR") {
    redirect("/dashboard/doctor");
  } else if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/patient");
  }
}
