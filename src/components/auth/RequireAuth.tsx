"use client"

import PageLoader from "../loader"
import AuthGuard from "./AuthGuard"

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard fallback={<PageLoader />}>{children}</AuthGuard>
}
