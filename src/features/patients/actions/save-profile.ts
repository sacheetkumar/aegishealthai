"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SaveProfileInput {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  height: number;
  weight: number;
}

export async function savePatientProfile(data: SaveProfileInput) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized access." };
    }

    const { name, age, gender, bloodType, height, weight } = data;

    if (!name || !age || !gender || !bloodType || !height || !weight) {
      return { success: false, error: "All profile details are required." };
    }

    if (age <= 0 || height <= 0 || weight <= 0) {
      return { success: false, error: "Please enter valid positive values for age, height, and weight." };
    }

    // Fetch the user
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      include: { patientProfile: true }
    });

    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    if (dbUser.role !== "PATIENT") {
      return { success: false, error: "Only patients can execute clinical onboarding." };
    }

    // Update inside a transaction if supported, or sequentially
    await db.$transaction(async (tx) => {
      // 1. Update user name
      await tx.user.update({
        where: { id: dbUser.id },
        data: { name }
      });

      // 2. Upsert or update patient profile
      if (dbUser.patientProfile) {
        await tx.patientProfile.update({
          where: { userId: dbUser.id },
          data: {
            age,
            gender,
            bloodType,
            height,
            weight
          }
        });
      } else {
        await tx.patientProfile.create({
          data: {
            userId: dbUser.id,
            age,
            gender,
            bloodType,
            height,
            weight,
            allergies: []
          }
        });
      }
    });

    // Revalidate the dashboard page to update cache
    revalidatePath("/dashboard/patient");

    return { success: true };
  } catch (error) {
    console.error("Save patient profile action error:", error);
    const message = error instanceof Error ? error.message : "An error occurred saving your profile.";
    return { success: false, error: message };
  }
}
