"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "./client"

/* ------------------ Types ------------------ */

export interface AITranscriptFilters {
  phone_number?: string
  client_state?: string
  status?: string
  scenario?: string
  page?: number
  limit?: number
}

export interface AITranscriptItem {
  [key: string]: any // adjust once backend response is known
}

export interface AITranscriptsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface AITranscriptsApiResponse {
  status: string
  data: AITranscriptItem[]
  pagination?: AITranscriptsPagination
  message?: string
  [key: string]: any
}

/* ------------------ Hook ------------------ */

export function useAITranscripts(filters: AITranscriptFilters = {}) {
  return useQuery({
    queryKey: ["ai-transcripts", filters],
    queryFn: async (): Promise<AITranscriptsApiResponse> => {
      const body = {
        phone_number: filters.phone_number ?? "",
        client_state: filters.client_state ?? "",
        status: filters.status ?? "",
        scenario: filters.scenario ?? "",
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
      }

      const res = await apiClient.post<AITranscriptsApiResponse>(
        "/fetch-ai-transcripts.php",
        body
      )

      const payload = res.data

      if (!payload) throw new Error("Failed to fetch transcripts")

      if (payload.status === "success") {
        return {
          ...payload,
          data: Array.isArray(payload.data) ? payload.data : [],
        }
      }

      if (payload.status === "empty") {
        return {
          ...payload,
          status: "success",
          data: [],
          pagination: payload.pagination ?? {
            current_page: body.page,
            per_page: body.limit,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        }
      }

      throw new Error(payload.message || "Failed to fetch transcripts")
    },
  })
}
