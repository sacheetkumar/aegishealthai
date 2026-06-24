"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Initiates the password reset flow.
 * Generates a verification token and prints the reset URL in the console for testing.
 */
export async function requestPasswordReset(email: string) {
  try {
    if (!email) {
      return { success: false, error: "Email is required." };
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success to prevent email discovery attacks, standard production security practice
      return { success: true, message: "If that email exists in our system, we have sent a reset link." };
    }

    // Generate a secure, unique token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    // Delete any existing tokens for this email to avoid duplicates
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create the token in the database
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // TODO: Send email with reset link via email service (e.g. Resend, SendGrid)

    return { 
      success: true, 
      message: "If that email exists in our system, we have sent a reset link." 
    };
  } catch (error) {
    console.error("Request password reset error:", error);
    return { success: false, error: "An error occurred while generating the reset link." };
  }
}

/**
 * Validates the token and updates the user's password.
 */
export async function resetPassword(data: {
  email: string;
  token: string;
  password?: string;
}) {
  try {
    const { email, token, password } = data;

    if (!email || !token || !password) {
      return { success: false, error: "All fields are required." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    // Verify token exists and is valid
    const resetToken = await db.passwordResetToken.findFirst({
      where: { email, token },
    });

    if (!resetToken) {
      return { success: false, error: "Invalid token or email verification failed." };
    }

    // Verify token has not expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { success: false, error: "This link has expired. Please request another reset link." };
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Run password update and token deletion inside a transaction
    await db.$transaction([
      db.user.update({
        where: { email },
        data: { passwordHash },
      }),
      db.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "An error occurred during password update." };
  }
}
