"use server";

import { db } from "@/lib/db";

export interface DoctorListItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  specialty: string;
  licenseNumber: string;
  experienceYears: number;
  phone: string | null;
  address: string | null;
  bio: string | null;
  averageRating: number;
  ratingCount: number;
  latitude: number;
  longitude: number;
}

const CLINICS = [
  { address: "Aegis Clinic, Connaught Place, New Delhi", latitude: 28.6304, longitude: 77.2177, phone: "+91 11 4356 7890" },
  { address: "Aegis Cardiology, Bandra West, Mumbai", latitude: 19.0544, longitude: 72.8402, phone: "+91 22 2640 1234" },
  { address: "Aegis Health Centre, Indiranagar, Bengaluru", latitude: 12.9784, longitude: 77.6408, phone: "+91 80 4125 5678" },
  { address: "Aegis Specialist Care, Nungambakkam, Chennai", latitude: 13.0617, longitude: 80.2384, phone: "+91 44 2827 9012" },
  { address: "Aegis Med Center, Jubilee Hills, Hyderabad", latitude: 17.4325, longitude: 78.4072, phone: "+91 40 6712 3456" },
  { address: "Aegis Clinic, Park Street, Kolkata", latitude: 22.5487, longitude: 88.3516, phone: "+91 33 2287 4567" },
  { address: "Aegis Care, Shivajinagar, Pune", latitude: 18.5308, longitude: 73.8475, phone: "+91 20 2553 7890" },
  { address: "Aegis Specialist Hospital, Satellite, Ahmedabad", latitude: 23.0298, longitude: 72.5273, phone: "+91 79 2676 1234" },
];

function getSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export async function listDoctors(): Promise<DoctorListItem[]> {
  try {
    const doctors = await db.doctorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        ratings: {
          select: {
            score: true
          }
        },
      }
    });

    return doctors.map(doc => {
      const ratingCount = doc.ratings.length;
      const averageRating = ratingCount > 0
        ? parseFloat((doc.ratings.reduce((acc, r) => acc + r.score, 0) / ratingCount).toFixed(1))
        : 0;

      const clinicIndex = getSimpleHash(doc.id) % CLINICS.length;
      const clinic = CLINICS[clinicIndex];

      return {
        id: doc.id,
        name: doc.user.name || "Unknown Doctor",
        email: doc.user.email || "",
        image: doc.user.image,
        specialty: doc.specialty,
        licenseNumber: doc.licenseNumber,
        experienceYears: doc.experienceYears,
        phone: doc.phone || clinic.phone,
        address: doc.address || clinic.address,
        bio: doc.bio,
        averageRating,
        ratingCount,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
      };
    });
  } catch (error) {
    console.error("List doctors error:", error);
    return [];
  }
}
