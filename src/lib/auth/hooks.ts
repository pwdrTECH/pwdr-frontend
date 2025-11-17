"use client"

import { apiClient } from "@/lib/api/client"
import type { LoginApiResponse } from "@/lib/api/types"
import {
  clearSession,
  consumeReturnTo,
  establishSession,
  getSession,
  getUserData,
  storeUserData,
  type LoginSession,
  type PowderUser,
} from "@/lib/auth/session"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

interface LoginPayload {
  email: string
  password: string
}

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginSession> => {
      const response = await apiClient.post<LoginApiResponse>(
        "/login.php",
        payload
      )
      const apiResponse = response.data

      if (!apiResponse) {
        throw new Error("No response from server")
      }

      // Check for success case
      if (
        apiResponse.status === "success" &&
        apiResponse.token &&
        apiResponse.data
      ) {
        const sessionData = {
          token: apiResponse.token,
          data: apiResponse.data,
        }

        // Establish session in localStorage and API client
        await establishSession(sessionData)
        storeUserData(apiResponse.data)

        return {
          access_token: apiResponse.token,
          user: apiResponse.data,
        }
      }
      if (apiResponse.status === "login invalid") {
        throw new Error(apiResponse.message || "Invalid email or password")
      }

      throw new Error(
        apiResponse.message || `Login failed with status: ${apiResponse.status}`
      )
    },
    onError: async (error: Error) => {
      console.error("Login mutation error:", error)
      await clearSession()
    },
    onSuccess: (data) => {
      // Update queries with new user data
      queryClient.setQueryData(["user"], data.user)
      queryClient.setQueryData(["session"], data)
      queryClient.invalidateQueries({ queryKey: ["auth"] })

      // Determine redirect based on user role
      const userRole = data.user?.user_type?.toLowerCase()
      let redirectPath = consumeReturnTo("/user")

      // Redirect to intended page or role-based home
      const returnTo = consumeReturnTo()
      if (returnTo && returnTo !== "/user") {
        redirectPath = returnTo
      } else {
        // Otherwise, redirect based on role
        redirectPath = userRole === "admin" ? "/admin" : "/user"
      }
      router.replace(redirectPath)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      await clearSession()
      return true
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ["user"] })
      queryClient.removeQueries({ queryKey: ["session"] })
      queryClient.removeQueries({ queryKey: ["auth"] })
      queryClient.clear()

      // Redirect to login
      router.push("/login")
    },
  })
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: (): LoginSession | null => {
      const session = getSession()
      if (!session?.access_token) return null

      const user = getUserData()
      if (!user) return null

      return {
        access_token: session.access_token,
        user,
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: (): PowderUser | null => {
      return getUserData()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuth() {
  const { data: session, isLoading: sessionLoading } = useSession()
  const { data: user, isLoading: userLoading } = useUser()

  return {
    user: user || session?.user,
    session,
    isLoading: sessionLoading || userLoading,
    isAuthenticated: !!session?.access_token,
  }
}

export function useAuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuth()

  return {
    isAuthenticated,
    isLoading,
    role: user?.user_type?.toLowerCase() as
      | "admin"
      | "user"
      | string
      | undefined,
    user,
  }
}
