"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

export interface AiTranscriptFilters {
  page?: number
  limit?: number
  search?: string
  phone_number?: string
  client_state?: string
  status?: string // e.g. "completed"
  scenario?: string // e.g. "claims"
}

export interface AiTranscriptItem {
  id: number | string
  phone_number?: string
  client_state?: string
  scenario?: string
  status?: string
  transcript?: string
  summary?: string
  created_at?: string
  [key: string]: any
}

export interface AiTranscriptResponse {
  status: string // "success" | "empty" | "error" etc
  data?: AiTranscriptItem[]
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  message?: string
  [key: string]: any
}

export function useAiTranscripts(
  filters: AiTranscriptFilters,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options ?? {}

  return useQuery({
    enabled,
    queryKey: ["ai-transcripts", filters],
    queryFn: async (): Promise<AiTranscriptResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search ?? "",
        phone_number: filters.phone_number ?? "",
        client_state: filters.client_state ?? "",
        status: filters.status ?? "completed",
        scenario: filters.scenario ?? "claims",
      }

      const res = await apiClient.post<AiTranscriptResponse>(
        "/fetch-ai-transcripts.php",
        body
      )

      const payload = res.data
      if (!payload) {
        throw new Error("Failed to fetch AI transcripts")
      }

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

      throw new Error(payload.message || "Failed to fetch AI transcripts")
    },
  })
}
