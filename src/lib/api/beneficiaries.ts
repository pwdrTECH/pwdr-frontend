"use client"

import { apiClient } from "@/lib/api/client"
import type { EnrolleeApiResponse } from "@/lib/api/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface CreateEnrolleePayload {
  email: string
  first_name: string
  surname: string
  other_names: string
  gender: string
  dob: string
  address: string
  city: string
  state: string
  phone: string
  marital_status?: string
  origin_state: string
  origin_lga: string
  employment_status?: string
  occupation?: string
  user_role: string
  principal_id: number | null
  plan_id: number
  next_of_kin?: string
  next_of_kin_relationship?: string
  next_of_kin_phone?: string
  next_of_kin_address?: string
  passport_image?: string
}

export function useCreateEnrollee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: CreateEnrolleePayload
    ): Promise<EnrolleeApiResponse> => {
      const formData = new FormData()
      // Add all other fields
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // For file uploads, we might need special handling
          if (key === "passport_image" && value) {
            // Convert base64 to blob for file upload
            const base64Data = value.split(",")[1] // Remove data URL prefix if present
            const byteCharacters = atob(base64Data)
            const byteArrays = []

            for (
              let offset = 0;
              offset < byteCharacters.length;
              offset += 512
            ) {
              const slice = byteCharacters.slice(offset, offset + 512)
              const byteNumbers = new Array(slice.length)

              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i)
              }

              const byteArray = new Uint8Array(byteNumbers)
              byteArrays.push(byteArray)
            }

            const blob = new Blob(byteArrays, { type: "image/jpeg" })
            formData.append("passport_image", blob, "passport.jpg")
          } else {
            formData.append(key, String(value))
          }
        }
      })

      // Use the upload method which sends FormData
      const response = await apiClient.upload<EnrolleeApiResponse>(
        "/new-enrolee.php",
        formData
      )

      const apiResponse = response.data

      if (!apiResponse || apiResponse.status !== "success") {
        throw new Error(apiResponse?.message || "Failed to create enrollee")
      }

      return apiResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollees"] })
    },
  })
}

export function useBeneficiaries(filters?: any) {
  return useQuery({
    queryKey: ["beneficiaries", filters],
    queryFn: () =>
      apiClient.get("/beneficiaries", {
        method: "POST",
        body: JSON.stringify(filters || {}),
      }),
  })
}
