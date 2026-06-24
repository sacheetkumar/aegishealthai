import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";

// Extend NextAuth / Auth.js typings for strict TypeScript checking using the @auth/core subpaths
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "doctor@aegishealth.ai" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[login] Missing credentials");
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        console.log("[login] Looking up user:", email);

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.log("[login] User not found:", email);
          return null;
        }

        if (!user.passwordHash) {
          console.log("[login] User has no password hash:", email);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log("[login] Password valid:", isPasswordValid);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ]
});
