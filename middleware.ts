import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";

const PUBLIC_PATHS = ["/a", "/not-it", "/api/auth", "/api/health", "/_next", "/favicon.svg", "/patterns", "/logo.svg"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
}

export default auth((req: NextRequest & { auth?: { role?: string; error?: string } }) => {
  const { pathname } = req.nextUrl;

  // Locale cookie passthrough — if ?lang= is present, set the cookie and rewrite.
  const lang = req.nextUrl.searchParams.get("lang");
  if (lang === "en" || lang === "id") {
    const res = NextResponse.redirect(new URL(pathname, req.url));
    res.cookies.set("NEXT_LOCALE", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Authenticated check
  if (!req.auth) {
    const signIn = new URL("/api/auth/signin", req.url);
    signIn.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signIn);
  }

  // IT-gate: anyone resolved as "member" lands on /not-it, not the app.
  const role = req.auth.role as string | undefined;
  if (role === "member") {
    if (pathname !== "/not-it") return NextResponse.redirect(new URL("/not-it", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|patterns|logo.svg).*)"],
};
