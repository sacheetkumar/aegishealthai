import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PatientDashboardClient } from "@/features/patients/components/patient-dashboard-client";
import { PatientOnboardingForm } from "@/features/patients/components/patient-onboarding-form";

export default async function PatientDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Ensure only Patients can access this specific layout segment
  if (session.user.role !== "PATIENT" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch linked patient profile
  const dbUser = await db.user.findUnique({
    where: { email: session.user.email },
    include: { patientProfile: true }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const profile = dbUser.patientProfile;
  const isProfileIncomplete = 
    !profile || 
    profile.age === null || profile.age === undefined ||
    profile.height === null || profile.height === undefined ||
    profile.weight === null || profile.weight === undefined ||
    !profile.gender || 
    !profile.bloodType;

  if (isProfileIncomplete) {
    return <PatientOnboardingForm initialName={dbUser.name} />;
  }

  const user = {
    name: dbUser.name,
    email: dbUser.email,
  };

  const patientProfile = {
    age: profile.age!,
    gender: profile.gender!,
    bloodType: profile.bloodType!,
    height: profile.height!,
    weight: profile.weight!,
  };

  return <PatientDashboardClient user={user} profile={patientProfile} />;
}
