"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AppointmentStatus } from "@prisma/client";

export async function bookAppointmentAction(data: {
  doctorId: string;
  availabilityId: string;
  scheduledAt: Date | string;
  reason: string;
}) {
  try {
    const { doctorId, availabilityId, scheduledAt, reason } = data;

    // 1. Authenticate user session
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    // 2. Fetch patient profile
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      include: { patientProfile: true }
    });

    if (!dbUser?.patientProfile) {
      return { success: false, error: "Only accounts registered as patients can schedule appointments." };
    }

    // 3. Verify availability slot
    const availability = await db.doctorAvailability.findUnique({
      where: { id: availabilityId }
    });

    if (!availability || availability.isBooked) {
      return { success: false, error: "This timeslot is no longer available. Please select another slot." };
    }

    // 4. Update availability to booked and create appointment in a transaction
    await db.$transaction([
      db.doctorAvailability.update({
        where: { id: availabilityId },
        data: { isBooked: true }
      }),
      db.appointment.create({
        data: {
          patientId: dbUser.patientProfile.id,
          doctorId: doctorId,
          scheduledAt: new Date(scheduledAt),
          status: AppointmentStatus.CONFIRMED,
          reason: reason,
          notes: "Scheduled automatically via AI Symptom Checker recommendations."
        }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Booking Action Error:", error);
    return { success: false, error: "Failed to book your appointment. Please try again." };
  }
}
