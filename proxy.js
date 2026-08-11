import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/registry", "/payments"];

/**
 * Only checks for the *presence* of the refresh_token cookie — it cannot
 * safely verify a JWT signature here without duplicating the backend's
 * secret into the edge runtime. This purely prevents a flash of protected
 * UI for obviously-signed-out visitors; the backend's permission classes
 * remain the actual authorization boundary.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has("refresh_token");
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/registry/:path*", "/payments/:path*"],
};
