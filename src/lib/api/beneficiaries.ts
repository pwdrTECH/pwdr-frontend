"use client"

import { apiClient } from "@/lib/api/client"
import type { EnrolleeApiResponse } from "@/lib/api/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface BeneficiaryFilters {
  page?: number
  limit?: number
  search?: string
  // add more later: plan_id, state, etc.
}
export interface BeneficiaryFilters {
  page?: number
  limit?: number
  search?: string
}

export interface RawBeneficiary {
  id: number
  email: string | null
  first_name: string | null
  surname: string | null
  other_names: string | null
  gender: string | null
  dob: string | null
  address: string | null
  city: string | null
  state: number | null
  phone: string | null
  marital_status: string | null
  origin_state: number | null
  origin_lga: number | null
  employment_status: string | null
  occupation: string | null
  active: number
  date_created: number
  enrolee_id: string | null
  user_role: string | null
  principal_id: number | null
  hmo_id: number
  plan_id: number
  next_of_kin: string | null
  next_of_kin_relationship: string | null
  next_of_kin_phone: string | null
  next_of_kin_address: string | null
  plan_name: string | null
  state_name: string | null
}

export interface BeneficiariesResponse {
  status: string
  data?: RawBeneficiary[]
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

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
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "passport_image" && value) {
            const base64Data = value.split(",")[1]
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

export function useBeneficiaries(filters: BeneficiaryFilters = {}) {
  return useQuery({
    queryKey: ["beneficiaries", filters],
    queryFn: async () => {
      // For now: fetch *many* and let UI paginate on client
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 500, // big enough to cover all
        search: filters.search ?? "",
      }

      const res = await apiClient.post<BeneficiariesResponse>(
        "/fetch-enrolees.php",
        body
      )

      return res.data
    },
  })
}
