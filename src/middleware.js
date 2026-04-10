import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Paths that don't require authentication
const publicPaths = ["/login", "/signup"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public paths don't need auth, but if authenticated, redirect to /dashboard
  const isPublicPath = publicPaths.includes(pathname);
  
  // Exclude API routes, next strict static files, etc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  let user = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload.id && typeof payload.id === "object") {
         throw new Error("Corrupt Payload");
      }
      user = payload;
    } catch (error) {
      console.error("Middleware JWT verification failed");
    }
  }

  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isPublicPath && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
