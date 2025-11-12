import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const cookieOpts = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET() {
  const c = await cookies();
  const access_token = c.get("access_token")?.value || "";
  const refresh_token = c.get("refresh_token")?.value || "";
  const role = c.get("role")?.value || "";
  const expires_at = c.get("expires_at")?.value || "";
  return NextResponse.json({ access_token, refresh_token, role, expires_at });
}

/**
 * Merge write:
 * You can send any subset of {access_token, refresh_token, expires_at, role}
 * and we'll only set what you pass (no more “Missing token or role”).
 */
export async function POST(req: NextRequest) {
  const { access_token, refresh_token, expires_at, role } = await req
    .json()
    .catch(() => ({}));

  const res = NextResponse.json({ message: "Session updated" });

  // Only set cookies you actually provided (prevents overwriting with empty values)
  if (typeof access_token === "string" && access_token.length > 0) {
    res.cookies.set("access_token", access_token, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  if (typeof refresh_token === "string" && refresh_token.length > 0) {
    res.cookies.set("refresh_token", refresh_token, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (typeof expires_at === "string" && expires_at.length > 0) {
    res.cookies.set("expires_at", expires_at, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (typeof role === "string" && role.length > 0) {
    res.cookies.set("role", role.toLowerCase(), {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ message: "Session cleared" });
  const c = res.cookies;
  c.set("access_token", "", { ...cookieOpts, maxAge: 0 });
  c.set("refresh_token", "", { ...cookieOpts, maxAge: 0 });
  c.set("expires_at", "", { ...cookieOpts, maxAge: 0 });
  c.set("role", "", { ...cookieOpts, maxAge: 0 });
  return res;
}
