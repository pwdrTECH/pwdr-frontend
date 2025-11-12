import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/v1";

function buildUrl(pathSegments: string[], search: string) {
  const path = pathSegments.join("/");
  const url = new URL(`${API_BASE}/${path}`);
  if (search) {
    const sp = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search,
    );
    sp.forEach((v, k) => url.searchParams.set(k, v));
  }
  return url.toString();
}

async function proxy(req: NextRequest) {
  const jar = await cookies();
  const token = jar.get("access_token")?.value || "";
  const pathSegments = req.nextUrl.pathname
    .replace(/^\/api\/bff\//, "")
    .split("/");
  const targetUrl = buildUrl(pathSegments, req.nextUrl.search);

  // Copy headers except host-related ones
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  // Inject Authorization if we have a token
  if (token) headers.set("authorization", `Bearer ${token}`);

  // Forward the body for non-GETs
  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.arrayBuffer();
    init.body = body;
  }

  const resp = await fetch(targetUrl, init);

  // Pass through JSON (or stream if needed)
  const contentType = resp.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await resp.json().catch(() => ({}))
    : await resp.text();

  const out = NextResponse.json(typeof data === "string" ? { data } : data, {
    status: resp.status,
  });

  // Optionally forward set-cookie from backend (if backend sets its own cookies)
  const setCookie = resp.headers.get("set-cookie");
  if (setCookie) out.headers.set("set-cookie", setCookie);

  return out;
}

export async function GET(req: NextRequest) {
  return proxy(req);
}
export async function POST(req: NextRequest) {
  return proxy(req);
}
export async function PATCH(req: NextRequest) {
  return proxy(req);
}
export async function PUT(req: NextRequest) {
  return proxy(req);
}
export async function DELETE(req: NextRequest) {
  return proxy(req);
}
