import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DoctorDashboardClient } from "@/features/doctors/components/doctor-dashboard-client";

export default async function DoctorDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Enforce DOCTOR (or ADMIN) role restriction
  if (session.user.role !== "DOCTOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Look up doctor profile details from database
  let profile = {
    specialty: "General Medicine",
    licenseNumber: "LIC-MOCK-9988",
  };

  try {
    const dbProfile = await db.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (dbProfile) {
      profile = {
        specialty: dbProfile.specialty,
        licenseNumber: dbProfile.licenseNumber,
      };
    }
  } catch (error) {
    console.error("Failed to query doctor profile:", error);
    // Keep defensive mock profile fallback for testing/robustness
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
  };

  return <DoctorDashboardClient user={user} profile={profile} />;
}
