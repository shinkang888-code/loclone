import { NextResponse, type NextRequest } from "next/server";
import { isAuthDisabled, SESSION_COOKIE } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (isAuthDisabled()) {
      return NextResponse.next();
    }
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
