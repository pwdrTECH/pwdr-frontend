import { NextResponse, NextRequest } from "next/server"

function toAppRole(userType: string | undefined): "admin" | "user" {
  return (userType || "").toLowerCase() === "admin" ? "admin" : "user"
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get("access_token")?.value
  const session =
    req.cookies.get("ss_session")?.value ||
    req.cookies.get("sessionid")?.value ||
    req.cookies.get("auth_session")?.value
  const rawRole = (req.cookies.get("role")?.value || "").toLowerCase()
  const userType = (req.cookies.get("user_type")?.value || "").toLowerCase()

  let role = rawRole as "admin" | "user" | ""
  if (!role && userType) {
    role = toAppRole(userType)
  }

  const isAuth = Boolean(token || session || role)
  const isAdmin = role === "admin"
  const isUser = role === "user"

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")

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

  // Protect /admin
  if (!res && pathname.startsWith("/admin")) {
    if (!isAuth || !isAdmin) {
      const url = req.nextUrl.clone()
      url.pathname = isAuth && isUser ? "/admin" : "/login/admin"
      res = NextResponse.redirect(url)
    }
  }

  // Protect /user (must be logged in; any role ok)
  if (!res && pathname.startsWith("/user")) {
    if (!isAuth) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      res = NextResponse.redirect(url)
    }
  }

  // If we haven't created a response yet, continue
  if (!res) res = NextResponse.next()

  // If we derived role from user_type and didn't have a role cookie, set it for future requests
  if (!rawRole && role) {
    res.cookies.set("role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return res
}

export const config = {
  // match all app routes except static and images by default
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
