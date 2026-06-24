"use server";

import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: "PATIENT" | "DOCTOR" | "ADMIN") {
  try {
    if (!userId || !newRole) {
      return { success: false, error: "Missing required fields." };
    }

    await db.user.update({
      where: { id: userId },
      data: { role: newRole as UserRole },
    });

    // Refresh Next.js server cache for the admin layout
    revalidatePath("/dashboard/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    const message = error instanceof Error ? error.message : "Failed to update role.";
    return { success: false, error: message };
  }
}
