"use server";

import { db } from "@/lib/db";
import { type RecommendedDoctor } from "@/features/doctors/actions/recommend-doctors";

export interface ParseOcrResponse {
  success: boolean;
  isPrescription?: boolean;
  error?: string;
  data?: {
    patientName: string | null;
    doctorName: string | null;
    disease: string | null;
    medications: string[];
    symptoms: string[];
    precautions: string[];
    rawText: string;
  };
  prescribedDoctor?: RecommendedDoctor | null;
}

export async function parsePrescriptionAction(rawText: string): Promise<ParseOcrResponse> {
  try {
    const fastapiResponse = await fetch("http://localhost:8000/parse-prescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: rawText }),
    });

    if (!fastapiResponse.ok) {
      const errorText = await fastapiResponse.text();
      return {
        success: false,
        error: `AI parsing failed: ${errorText || fastapiResponse.statusText}`
      };
    }

    const result = await fastapiResponse.json();
    if (!result.success) {
      return {
        success: false,
        error: result.error || "AI was unable to parse the document."
      };
    }

    if (!result.is_prescription) {
      return {
        success: false,
        isPrescription: false,
        error: "The uploaded file does not appear to be a valid medical prescription. Please ensure it is a clear prescription chart containing medical notations."
      };
    }

    // Doctor lookup in database
    let prescribedDoctorFormatted: RecommendedDoctor | null = null;
    if (result.doctor_name) {
      // Clean prefix e.g. "Dr. Rajesh Sharma" -> "Rajesh Sharma"
      const cleanedDoctorName = result.doctor_name.replace(/^(dr\.|dr|doctor)\s+/i, "").trim();
      
      const matchedDoctor = await db.doctorProfile.findFirst({
        where: {
          user: {
            name: {
              contains: cleanedDoctorName,
              mode: "insensitive"
            }
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            }
          },
          availabilities: {
            where: {
              isBooked: false,
            },
            orderBy: [
              { dayOfWeek: "asc" },
              { startTime: "asc" }
            ]
          },
          ratings: {
            select: {
              score: true
            }
          }
        }
      });

      if (matchedDoctor) {
        const ratingCount = matchedDoctor.ratings.length;
        const averageRating = ratingCount > 0
          ? parseFloat((matchedDoctor.ratings.reduce((acc, r) => acc + r.score, 0) / ratingCount).toFixed(1))
          : 4.5;

        prescribedDoctorFormatted = {
          id: matchedDoctor.id,
          name: matchedDoctor.user.name || "Unknown Doctor",
          email: matchedDoctor.user.email || "",
          image: matchedDoctor.user.image,
          specialty: matchedDoctor.specialty,
          experienceYears: matchedDoctor.experienceYears,
          bio: matchedDoctor.bio,
          averageRating,
          ratingCount,
          matchedSpecialty: true,
          mobileNumber: (matchedDoctor as any).mobileNumber || null,
          clinicPhone: (matchedDoctor as any).clinicPhone || null,
          address: matchedDoctor.address || null,
          isRegistered: (matchedDoctor as any).isRegistered || false,
          availabilities: matchedDoctor.availabilities.map(av => ({
            id: av.id,
            dayOfWeek: av.dayOfWeek,
            startTime: av.startTime,
            endTime: av.endTime,
          }))
        };
      }
    }

    return {
      success: true,
      isPrescription: true,
      data: {
        patientName: result.patient_name,
        doctorName: result.doctor_name,
        disease: result.disease,
        medications: result.medications,
        symptoms: result.symptoms,
        precautions: result.precautions,
        rawText: rawText
      },
      prescribedDoctor: prescribedDoctorFormatted
    };
  } catch (error: any) {
    console.error("Parse Prescription Action Error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during document analysis."
    };
  }
}
