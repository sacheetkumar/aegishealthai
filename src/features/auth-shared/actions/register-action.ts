"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  role: "PATIENT" | "DOCTOR";
  specialty?: string;
  licenseNumber?: string;
  mobileNumber?: string;
  clinicPhone?: string;
  address?: string;
}) {
  try {
    const { name, password, role, specialty, licenseNumber, mobileNumber, clinicPhone, address } = data;
    const email = data.email.toLowerCase().trim();

    if (!email || !name) {
      return { success: false, error: "Name and email are required." };
    }

    // Verify if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    let passwordHash: string | null = null;
    if (password) {
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Execute User and Profile creation inside a secure database transaction
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role as UserRole,
        },
      });

      if (role === "PATIENT") {
        await tx.patientProfile.create({
          data: {
            userId: user.id,
            allergies: [],
          },
        });
      } else if (role === "DOCTOR") {
        if (!specialty || !licenseNumber || !mobileNumber || !clinicPhone || !address) {
          throw new Error("Specialty, license number, mobile number, clinic phone and address are required for Doctor registration.");
        }
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            specialty,
            licenseNumber,
            mobileNumber,
            clinicPhone,
            address,
            isRegistered: true,
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration action error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong during registration.";
    return { success: false, error: message };
  }
}

export async function isGoogleConfigured() {
  return !!(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET &&
    process.env.AUTH_GOOGLE_ID !== "your-registered-google-client-id" &&
    process.env.AUTH_GOOGLE_ID !== "mock-google-id"
  );
}
