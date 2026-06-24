import type { NextAuthConfig, DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

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

function isGoogleConfiguredSync() {
  return !!(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET &&
    process.env.AUTH_GOOGLE_ID !== "your-registered-google-client-id" &&
    process.env.AUTH_GOOGLE_ID !== "mock-google-id"
  );
}

export const authConfig = {
  trustHost: true,
  providers: [
    ...(isGoogleConfiguredSync()
      ? [Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        })]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      
      if (isDashboard) {
        if (isLoggedIn) return true;
        return false; // Default NextAuth redirect to login page
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role || "PATIENT";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || "PATIENT";
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
