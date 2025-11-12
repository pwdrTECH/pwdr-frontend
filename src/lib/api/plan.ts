"use client"

import apiClient from "@/lib/api/client"
import { getSession } from "@/lib/auth/session"
import { useMutation } from "@tanstack/react-query"

type NewPlanPayload = {
  scheme_id: number
  name: string
}

type NewPlanResponse = {
  status: "success" | "exist" | "error"
  message?: string
  // Backend also sometimes returns: "Plan exist for scheme": ""
  [key: string]: any
}

export function useCreatePlan() {
  return useMutation({
    mutationFn: async (payload: NewPlanPayload) => {
      const session = getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error("You must be logged in to create a plan.")
      }

      const res = await apiClient.post<NewPlanResponse>("/new-plan.php", {
        token,
        ...payload,
      })

      const data = res.data

      if (!data) {
        throw new Error("No response from server.")
      }

      if (data.status === "error") {
        throw new Error(data.message || "Unable to create plan.")
      }

      if (data.status === "exist") {
        throw new Error("Plan already exists for this scheme.")
      }

      if (data.status !== "success") {
        throw new Error("Unexpected response from server.")
      }

      return data
    },
  })
}
