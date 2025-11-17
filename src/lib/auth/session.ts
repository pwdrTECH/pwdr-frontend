"use client"

import { apiClient } from "@/lib/api/client"

const AT_KEY = "powder_at"
const ROLE_KEY = "powder_role"
const RT_KEY = "powder_return_to"

function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export type PowderUser = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  user_type: string
}

export type LoginSession = {
  access_token: string | undefined
  user: PowderUser | undefined
}

/** Save token + user, sync apiClient */
export async function establishSession(payload: {
  token: string
  data: PowderUser
}) {
  if (!hasWindow()) return

  const access = payload.token
  const role = (payload.data?.user_type || "user").toLowerCase()

  if (access) {
    apiClient.setAuthToken(access)
    localStorage.setItem(AT_KEY, access)

    // Set HTTP-only cookies for middleware
    await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: access,
        role: role,
        user_type: payload.data.user_type,
      }),
    })
  } else {
    apiClient.removeAuthToken()
    localStorage.removeItem(AT_KEY)
  }

  localStorage.setItem(ROLE_KEY, role)
}

/** Clear all auth */
export async function clearSession() {
  if (!hasWindow()) return
  apiClient.removeAuthToken()
  localStorage.removeItem(AT_KEY)
  localStorage.removeItem(ROLE_KEY)
}

/** Re-apply bearer on app load */
export function rehydrateSessionFromStorage() {
  if (!hasWindow()) return
  const t = localStorage.getItem(AT_KEY)
  if (t) apiClient.setAuthToken(t)
}

/** Get token from localStorage */
export function getToken(): string | null {
  if (!hasWindow()) return null
  return localStorage.getItem(AT_KEY)
}

/** Read helpers */
export function getSession(): {
  access_token: string
  role: string
  user?: PowderUser
} | null {
  if (!hasWindow()) return null
  const access_token = localStorage.getItem(AT_KEY)
  if (!access_token) return null
  const role = localStorage.getItem(ROLE_KEY) || "user"

  // Try to get user data from localStorage if available
  const userData = localStorage.getItem("powder_user")
  const user = userData ? JSON.parse(userData) : undefined

  return { access_token, role, user }
}

export function isAuthenticated() {
  return !!getSession()
}

export function getRole() {
  return getSession()?.role ?? "user"
}

/** Store a "return to" URL before being kicked to /login */
export function rememberReturnTo(url?: string) {
  if (!hasWindow()) return
  const val =
    url ??
    (document.referrer && !document.referrer.includes("/login")
      ? document.referrer
      : "/user")
  localStorage.setItem(RT_KEY, val)
}

/** Read & clear stored return URL */
export function consumeReturnTo(defaultUrl = "/user") {
  if (!hasWindow()) return defaultUrl
  const v = localStorage.getItem(RT_KEY)
  if (v) localStorage.removeItem(RT_KEY)
  return v || defaultUrl
}

// Store user data separately for easy access
export function storeUserData(user: PowderUser) {
  if (!hasWindow()) return
  localStorage.setItem("powder_user", JSON.stringify(user))
}

export function getUserData(): PowderUser | null {
  if (!hasWindow()) return null
  const userData = localStorage.getItem("powder_user")
  return userData ? JSON.parse(userData) : null
}

// Initialize on import
if (hasWindow()) {
  rehydrateSessionFromStorage()
}
