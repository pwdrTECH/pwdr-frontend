"use client"

import { apiClient } from "@/lib/api/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/* =========================================================
   Shared helpers / types
========================================================= */

export interface ReportsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type ApiStatus = "success" | "empty" | "error" | string

export type ReportResponse<TSummary, TRow> = {
  status: ApiStatus
  data?: {
    summary: TSummary
    line_listing: TRow[]
    pagination: ReportsPagination
  }
  message?: string
  [key: string]: any
}

function makeEmptyPagination(page: number, limit: number): ReportsPagination {
  return {
    current_page: page,
    per_page: limit,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  }
}

/** Stable stringify for deterministic react-query keys */
function stableStringify(value: any): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  const keys = Object.keys(value).sort()
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`
  )
  return `{${entries.join(",")}}`
}
function stableKey(filters: Record<string, any>) {
  return stableStringify(filters ?? {})
}

/* =========================================================
   Billing list endpoint (useBilling)
   NOTE: adjust URL if yours differs.
========================================================= */

export type BillingFilters = {
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
  provider_id?: string
  min_cost?: string | number
  max_cost?: string | number
  status?: string
}

export type BillingSummary = {
  total_bills_due?: number
  total_bills_paid?: number
  number_of_bills?: number
  total_cost_of_bills?: number
  [key: string]: any
}

export type BillingListItem = {
  invoice_number?: string
  due_date?: string
  provider_name?: string
  no_of_claims?: number | string
  total_cost?: number | string
  status?: string
  [key: string]: any
}

const EMPTY_BILLING_SUMMARY: BillingSummary = {
  total_bills_due: 0,
  total_bills_paid: 0,
  number_of_bills: 0,
  total_cost_of_bills: 0,
}

async function fetchBilling({
  body,
  page,
  limit,
}: {
  body: Record<string, any>
  page: number
  limit: number
}): Promise<ReportResponse<BillingSummary, BillingListItem>> {
  const res = await apiClient.post<
    ReportResponse<BillingSummary, BillingListItem>
  >("/fetch-billing.php", body)

  const payload = res.data
  if (!payload) throw new Error("Failed to fetch billing")

  const incoming = payload.data

  const safePagination: ReportsPagination =
    incoming?.pagination ?? makeEmptyPagination(page, limit)

  const safeListing: BillingListItem[] = Array.isArray(incoming?.line_listing)
    ? (incoming?.line_listing as BillingListItem[])
    : []

  if (payload.status === "success") {
    return {
      ...payload,
      data: {
        summary: (incoming?.summary ?? {}) as BillingSummary,
        line_listing: safeListing,
        pagination: safePagination,
      },
    }
  }

  if (payload.status === "empty") {
    return {
      ...payload,
      status: "success",
      data: {
        summary: (incoming?.summary ?? {}) as BillingSummary,
        line_listing: [],
        pagination: makeEmptyPagination(page, limit),
      },
    }
  }

  throw new Error(payload.message || "Failed to fetch billing")
}

export function useBilling(filters: BillingFilters = {}) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["billing", "list", key],
    queryFn: async (): Promise<
      ReportResponse<BillingSummary, BillingListItem>
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 10

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        provider_id: filters.provider_id ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        status: filters.status ?? "",
      }

      const normalized = await fetchBilling({ body, page, limit })

      return {
        ...normalized,
        data: {
          summary: {
            ...EMPTY_BILLING_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* =========================================================
   set-invoice-paid (POST)
========================================================= */

export type SetInvoicePaidResponse = {
  status: "success" | "error" | string
  message?: string
  [key: string]: any
}

async function setInvoicePaid(invoice_number: string) {
  const invoice = String(invoice_number ?? "").trim()
  if (!invoice) throw new Error("invoice_number is required")

  const res = await apiClient.post<SetInvoicePaidResponse>(
    "/set-invoice-paid.php",
    {
      invoice_number: invoice,
    }
  )

  const payload = res.data
  if (!payload) throw new Error("Failed to mark invoice as paid")
  if (payload.status !== "success") {
    throw new Error(payload.message || "Failed to mark invoice as paid")
  }
  return payload
}

export function useSetInvoicePaid() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (invoice_number: string) =>
      setInvoicePaid(invoice_number),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["billing", "list"] })
    },
  })
}

export type BillingDetailsItem = {
  encounter_date: string
  enrolee_id: string
  enrolee_name: string
  diagnosis: string
  services: {
    code: string
    items: { service_name: string; item_type: string; cost: number }[]
    total: number
  }[]
  total_cost: number
}

export type BillingDetailsResponse = {
  status: "success" | "error" | string
  data?: BillingDetailsItem[]
  message?: string
  [key: string]: any
}

function normalizeBillingDetails(data: BillingDetailsItem[]) {
  const map = new Map<string, BillingDetailsItem>()

  for (const row of data ?? []) {
    const codes = (row.services ?? []).map((s) => s.code).join("|")
    const key = `${row.encounter_date}|${row.enrolee_id}|${row.diagnosis}|${codes}`
    if (!map.has(key)) map.set(key, row)
  }

  return Array.from(map.values())
}

async function fetchBillingDetails(invoice_number: string) {
  const invoice = String(invoice_number ?? "").trim()
  if (!invoice) throw new Error("invoice_number is required")

  const url = `/fetch-billing-details.php?invoice_number=${encodeURIComponent(
    invoice
  )}`

  const res = await apiClient.get<BillingDetailsResponse>(url)
  const payload = res.data

  if (!payload) throw new Error("Failed to fetch billing details")
  if (payload.status !== "success") {
    throw new Error(payload.message || "Failed to fetch billing details")
  }

  const list = Array.isArray(payload.data) ? payload.data : []
  return normalizeBillingDetails(list)
}

export function useBillingDetails(invoice_number?: string, enabled = true) {
  const inv = String(invoice_number ?? "").trim()

  return useQuery({
    queryKey: ["billing", "details", inv],
    enabled: enabled && !!inv,
    queryFn: async () => fetchBillingDetails(inv),
  })
}
