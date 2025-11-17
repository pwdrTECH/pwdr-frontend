import { type NextRequest, NextResponse } from "next/server"

function toAppRole(userType: string | undefined): "admin" | "user" {
  return (userType || "").toLowerCase() === "admin" ? "admin" : "user"
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get authentication and role information from cookies
  const token = req.cookies.get("access_token")?.value
  const session =
    req.cookies.get("ss_session")?.value ||
    req.cookies.get("sessionid")?.value ||
    req.cookies.get("auth_session")?.value
  const rawRole = (req.cookies.get("role")?.value || "").toLowerCase()
  const userType = (req.cookies.get("user_type")?.value || "").toLowerCase()

  // Determine user role
  let role = rawRole as "admin" | "user" | ""
  if (!role && userType) {
    role = toAppRole(userType)
  }

  const isAuth = Boolean(token || session || role)
  const isAdmin = role === "admin"

  // Public routes that don't require authentication
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") || // Next.js internals
    pathname.includes(".") || // Static files
    pathname === "/" // Root redirects based on auth

  // Build a response early so we can set cookies if needed
  let res: NextResponse | null = null

  // If not authenticated: only allow public routes
  if (!isAuth && !isPublic) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // If authenticated and at "/", route by role
  if (isAuth && pathname === "/") {
    const url = req.nextUrl.clone()
    url.pathname = isAdmin ? "/admin" : "/user"
    res = NextResponse.redirect(url)
  }

  // Protect /admin routes - only admins can access
  if (!res && pathname.startsWith("/admin")) {
    if (!isAuth) {
      // Not authenticated - redirect to login
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      res = NextResponse.redirect(url)
    } else if (!isAdmin) {
      // Authenticated but not admin - redirect to unauthorized or user dashboard
      const url = req.nextUrl.clone()
      url.pathname = "/unauthorized"
      res = NextResponse.redirect(url)
    }
  }

  // Protect /user routes - must be logged in (any role)
  if (!res && pathname.startsWith("/user")) {
    if (!isAuth) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      res = NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (
    !res &&
    isAuth &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    const url = req.nextUrl.clone()
    url.pathname = isAdmin ? "/admin" : "/user"
    res = NextResponse.redirect(url)
  }

  // If we haven't created a response yet, continue with the request
  if (!res) res = NextResponse.next()

  // If we derived role from user_type and didn't have a role cookie, set it for future requests
  if (!rawRole && role) {
    res.cookies.set("role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  // Also set user_type cookie if it's missing but we have the information
  if (!req.cookies.get("user_type")?.value && userType) {
    res.cookies.set("user_type", userType, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|img/).*)",
  ],
}
