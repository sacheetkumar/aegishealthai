import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(nextUrl.pathname);
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (isDashboardPage) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return Response.redirect(loginUrl);
    }

    // Role-Based Access Control (RBAC) path protection
    if (nextUrl.pathname.startsWith("/dashboard/doctor")) {
      if (role !== "DOCTOR" && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
    }

    if (nextUrl.pathname.startsWith("/dashboard/admin")) {
      if (role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
    }
  }
});

// Configure matcher to only run middleware on relevant auth and dashboard pages
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};
