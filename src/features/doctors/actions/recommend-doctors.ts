"use server";

import { db } from "@/lib/db";

// Comprehensive mapping of the 41 Kaggle prognoses to target clinical disciplines
const DISEASE_TO_SPECIALTY: Record<string, string> = {
  "Fungal infection": "Dermatology",
  "Allergy": "Pulmonology",
  "GERD": "Gastroenterology",
  "Chronic cholestasis": "Gastroenterology",
  "Drug Reaction": "Dermatology",
  "Peptic ulcer disease": "Gastroenterology",
  "AIDS": "Infectious Diseases",
  "Diabetes": "Endocrinology",
  "Gastroenteritis": "Gastroenterology",
  "Bronchial Asthma": "Pulmonology",
  "Hypertension": "Cardiology",
  "Migraine": "Neurology",
  "Cervical spondylosis": "Orthopedics",
  "Paralysis (brain hemorrhage)": "Neurology",
  "Jaundice": "Gastroenterology",
  "Malaria": "Infectious Diseases",
  "Chicken pox": "Infectious Diseases",
  "Dengue": "Infectious Diseases",
  "Typhoid": "Infectious Diseases",
  "Hepatitis A": "Gastroenterology",
  "Hepatitis B": "Gastroenterology",
  "Hepatitis C": "Gastroenterology",
  "Hepatitis D": "Gastroenterology",
  "Hepatitis E": "Gastroenterology",
  "Alcoholic hepatitis": "Gastroenterology",
  "Tuberculosis": "Pulmonology",
  "Common Cold": "Internal Medicine",
  "Pneumonia": "Pulmonology",
  "Dimorphic hemmorhoids(piles)": "General Surgery",
  "Heart attack": "Cardiology",
  "Varicose veins": "Vascular Surgery",
  "Hypothyroidism": "Endocrinology",
  "Hyperthyroidism": "Endocrinology",
  "Hypoglycemia": "Endocrinology",
  "Osteoarthristis": "Orthopedics",
  "Arthritis": "Orthopedics",
  "(vertigo) Paroymsal Positional Vertigo": "Neurology",
  "Acne": "Dermatology",
  "Urinary tract infection": "Infectious Diseases",
  "Psoriasis": "Dermatology",
  "Impetigo": "Dermatology"
};

export interface RecommendedDoctor {
  id: string;
  name: string;
  email: string;
  image: string | null;
  specialty: string;
  experienceYears: number;
  bio: string | null;
  averageRating: number;
  ratingCount: number;
  matchedSpecialty: boolean;
  mobileNumber: string | null;
  clinicPhone: string | null;
  address: string | null;
  isRegistered: boolean;
  availabilities: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export async function getDoctorRecommendations(diseaseName: string): Promise<RecommendedDoctor[]> {
  try {
    let matchedSpecialtyName = "Internal Medicine";
    try {
      const res = await fetch("http://localhost:8000/doctor-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disease: diseaseName })
      });
      if (res.ok) {
        const data = await res.json();
        matchedSpecialtyName = data.specialty || "Internal Medicine";
      } else {
        matchedSpecialtyName = DISEASE_TO_SPECIALTY[diseaseName] || "Internal Medicine";
      }
    } catch (err) {
      console.warn("Could not call FastAPI /doctor-recommendation, using local map:", err);
      matchedSpecialtyName = DISEASE_TO_SPECIALTY[diseaseName] || "Internal Medicine";
    }

    console.log(`Matching disease "${diseaseName}" to specialty "${matchedSpecialtyName}"`);

    // 1. Fetch doctors matching the target specialization (or fallbacks)
    const doctors = await db.doctorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        specializations: {
          include: {
            specialization: true
          }
        },
        ratings: {
          select: {
            score: true
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
        }
      }
    });

    // 2. Map, evaluate and score matching parameters
    const mapped: RecommendedDoctor[] = doctors.map(doc => {
      const specList = doc.specializations.map(s => s.specialization.name.toLowerCase());
      const isMatched = specList.includes(matchedSpecialtyName.toLowerCase());

      const ratingCount = doc.ratings.length;
      const averageRating = ratingCount > 0 
        ? parseFloat((doc.ratings.reduce((acc, r) => acc + r.score, 0) / ratingCount).toFixed(1))
        : 4.5; // default benchmark rating for newly registered specialists

      return {
        id: doc.id,
        name: doc.user.name || "Unknown Doctor",
        email: doc.user.email || "",
        image: doc.user.image,
        specialty: doc.specialty,
        experienceYears: doc.experienceYears,
        bio: doc.bio,
        averageRating,
        ratingCount,
        matchedSpecialty: isMatched,
        mobileNumber: (doc as any).mobileNumber || null,
        clinicPhone: (doc as any).clinicPhone || null,
        address: doc.address || null,
        isRegistered: (doc as any).isRegistered || false,
        availabilities: doc.availabilities.map(av => ({
          id: av.id,
          dayOfWeek: av.dayOfWeek,
          startTime: av.startTime,
          endTime: av.endTime,
        }))
      };
    });

    // Filter to doctors that match the specialty
    const matchingDocs = mapped.filter(d => d.matchedSpecialty);
    const resultList = matchingDocs.length > 0 ? matchingDocs : mapped;

    // 3. Sort recommended specialists by rating then experience
    resultList.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.experienceYears - a.experienceYears;
    });

    return resultList;
  } catch (error) {
    console.error("Recommendation Engine Error:", error);
    return [];
  }
}
