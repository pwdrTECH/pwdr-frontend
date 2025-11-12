"use client"

import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { clearSession, establishSession } from "@/lib/auth/session"

type LoginPayload = {
  email: string
  password: string
}

type LoginApiResponse = {
  status: string // "success" | "login invalid" | ...
  token?: string
  data?: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    user_type: string
  }
  message?: string
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await apiClient.post<LoginApiResponse>("/login.php", payload)

      const body = res.data

      if (!body || body.status !== "success" || !body.token || !body.data) {
        throw new Error(
          body?.message || "Invalid username and password combination"
        )
      }

      await establishSession({
        token: body.token,
        data: body.data,
      })

      return body
    },
    onError: () => {
      clearSession()
    },
  })
}
