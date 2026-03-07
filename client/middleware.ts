import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authToken = req.cookies.get("auth_token")?.value;
  const isAdmin = req.cookies.get("auth_is_admin")?.value === "1";

  if (!authToken) {
    const loginUrl = new URL("/login", req.url);
    const redirectTarget = `${pathname}${search || ""}`;
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAdmin) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
