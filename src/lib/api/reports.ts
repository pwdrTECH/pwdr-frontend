"use client"

import { apiClient } from "@/lib/api/client"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

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

/**
 * Generic report response.
 * NOTE: Some endpoints return extra fields on `data` (e.g. state_statistics).
 * For those, you can set `TExtra` to add them into `data`.
 */
export type ReportResponse<TSummary, TRow, TService = unknown, TExtra = {}> = {
  status: ApiStatus
  data?: {
    summary: TSummary
    line_listing: TRow[]
    top_services: TService[]
    pagination: ReportsPagination
  } & TExtra
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

/**
 * Stable stringify to keep react-query keys deterministic
 * even when filters are passed as new object references.
 */
function stableStringify(value: any): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  const keys = Object.keys(value).sort()
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as any)[k])}`
  )
  return `{${entries.join(",")}}`
}

/**
 * Use this for queryKey instead of raw filters object.
 * It prevents "refetch on every render" when parent recreates filters.
 */
function stableKey(filters: Record<string, any>) {
  return stableStringify(filters ?? {})
}

/* =========================================================
   1) REPORT API (single place for endpoints + normalized request)
========================================================= */

export type ReportEndpoint =
  | "fetch-utilization-by-enrolee"
  | "fetch-utilization-by-services"
  | "fetch-utilization-by-location"
  | "fetch-utilization-by-provider"
  | "fetch-utilization-by-scheme"
  | "fetch-utilization-by-diagnosis"
  | "fetch-utilization-by-organization"
  | "fetch-provider-requests"
  | "fetch-enrolee-requests"
  | "fetch-overdue-report"

const REPORT_ENDPOINTS: Record<ReportEndpoint, string> = {
  "fetch-utilization-by-enrolee": "/fetch-utilization-by-enrolee.php",
  "fetch-utilization-by-services": "/fetch-utilization-by-services.php",
  "fetch-utilization-by-location": "/fetch-utilization-by-location.php",
  "fetch-utilization-by-provider": "/fetch-utilization-by-provider.php",
  "fetch-utilization-by-scheme": "/fetch-utilization-by-scheme.php",
  "fetch-utilization-by-diagnosis": "/fetch-utilization-by-diagnosis.php",
  "fetch-utilization-by-organization": "/fetch-utilization-by-organization.php",
  "fetch-provider-requests": "/fetch-provider-requests.php",
  "fetch-enrolee-requests": "/fetch-enrolee-requests.php",
  "fetch-overdue-report": "/fetch-overdue-report.php",
}

export type BaseReportFilters = {
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
  min_cost?: string | number
  max_cost?: string | number
}

/** Utilization report filters (shared by enrolee/services/location/provider/scheme) */
export type UtilizationFilters = BaseReportFilters & {
  patient_id?: string
  patient_name?: string
  plan_id?: string | number
  plan?: string
}

/** Provider requests filters */
export type ProviderRequestsFilters = BaseReportFilters & {
  patient_id?: string
  patient_name?: string
}

/** Enrolee requests filters */
export type EnroleeRequestsFilters = BaseReportFilters & {
  enrolee_id?: string
  id?: string
  scheme_id?: string
  scheme?: string
  plan_id?: string | number
  plan?: string
}

type ReportFetchArgs = {
  endpoint: ReportEndpoint
  body: Record<string, any>
  page: number
  limit: number
}

/**
 * Fetches a report and normalizes:
 * - missing pagination
 * - missing line_listing
 * - missing top_services
 * - keeps any extra fields returned by the endpoint inside `data` (via spread)
 */
async function fetchReport<TSummary, TRow, TService = unknown, TExtra = {}>({
  endpoint,
  body,
  page,
  limit,
}: ReportFetchArgs): Promise<ReportResponse<TSummary, TRow, TService, TExtra>> {
  const url = REPORT_ENDPOINTS[endpoint]
  const res = await apiClient.post<
    ReportResponse<TSummary, TRow, TService, TExtra>
  >(url, body)

  const payload = res.data
  if (!payload) throw new Error("Failed to fetch report")

  const incoming = payload.data

  const safePagination: ReportsPagination =
    (incoming as any)?.pagination ?? makeEmptyPagination(page, limit)

  const safeListing: TRow[] = Array.isArray((incoming as any)?.line_listing)
    ? ((incoming as any).line_listing as TRow[])
    : []

  const safeTopServices: TService[] = Array.isArray(
    (incoming as any)?.top_services
  )
    ? ((incoming as any).top_services as TService[])
    : []

  const safeSummary: TSummary =
    ((incoming as any)?.summary as TSummary) ?? ({} as TSummary)

  if (payload.status === "success") {
    return {
      ...payload,
      data: {
        ...(incoming as any),
        summary: safeSummary,
        line_listing: safeListing,
        top_services: safeTopServices,
        pagination: safePagination,
      },
    }
  }

  if (payload.status === "empty") {
    return {
      ...payload,
      status: "success",
      data: {
        ...(incoming as any),
        summary: safeSummary,
        line_listing: [],
        top_services: safeTopServices,
        pagination: makeEmptyPagination(page, limit),
      },
    }
  }

  throw new Error(payload.message || "Failed to fetch report")
}

/* =========================================================
   2) HOOKS
========================================================= */

/* ----------------------------
   A) Enrolee requests report
---------------------------- */

export interface EnroleeRequestsSummary {
  total_requests_count: number
  total_claims_amount: number
  total_denied_count: number
  total_approved_claims_amount: number
  rejected_claims_amount: number
  pending_claims_amount: number
}

export interface EnroleeRequestListItem {
  enrolee_id: string
  enrolee_name: string
  plan: string
  scheme: string
  provider_name: string
  request_date: string
  status: string
  amount_claimed: number
  [key: string]: any
}

export interface EnroleeRequestsTopService {
  [key: string]: any
}

const EMPTY_ENROLEE_REQUESTS_SUMMARY: EnroleeRequestsSummary = {
  total_requests_count: 0,
  total_claims_amount: 0,
  total_denied_count: 0,
  total_approved_claims_amount: 0,
  rejected_claims_amount: 0,
  pending_claims_amount: 0,
}

export function useEnroleeRequests(
  filters: EnroleeRequestsFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-enrolee-requests", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        EnroleeRequestsSummary,
        EnroleeRequestListItem,
        EnroleeRequestsTopService
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        enrolee_id: filters.enrolee_id ?? "",
        id: filters.id ?? "",
        scheme_id: filters.scheme_id ?? "",
        scheme: filters.scheme ?? "",
        plan_id: filters.plan_id ?? "",
        plan: filters.plan ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
      }

      const normalized = await fetchReport<
        EnroleeRequestsSummary,
        EnroleeRequestListItem,
        EnroleeRequestsTopService
      >({
        endpoint: "fetch-enrolee-requests",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_ENROLEE_REQUESTS_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   B) Provider requests report
---------------------------- */

export interface ProviderRequestsSummary {
  total_requests_count: number
  total_denied_count: number
  total_billed_amount: number
  total_approved_amount: number
  approval_rate: number
}

export interface ProviderRequestListItem {
  provider_name: string
  provider_code: string
  total_requests_count: number
  approved_count: number
  denied_count: number
  approval_rate: number
  total_estimated_cost: number
  [key: string]: any
}

export interface ProviderRequestsTopService {
  [key: string]: any
}

const EMPTY_PROVIDER_REQUESTS_SUMMARY: ProviderRequestsSummary = {
  total_requests_count: 0,
  total_denied_count: 0,
  total_billed_amount: 0,
  total_approved_amount: 0,
  approval_rate: 0,
}

export function useProviderRequests(
  filters: ProviderRequestsFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-provider-requests", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        ProviderRequestsSummary,
        ProviderRequestListItem,
        ProviderRequestsTopService
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        patient_id: filters.patient_id ?? "",
        patient_name: filters.patient_name ?? "",
      }

      const normalized = await fetchReport<
        ProviderRequestsSummary,
        ProviderRequestListItem,
        ProviderRequestsTopService
      >({
        endpoint: "fetch-provider-requests",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_PROVIDER_REQUESTS_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   C) Utilization by Enrollee
---------------------------- */

export interface UtilizationByEnrolleeSummary {
  total_premium: number
  total_utilization_amount: number
  utilization_used: number
  balance: number
}

export interface UtilizationByEnrolleeListItem {
  enrolee_id: string
  enrolee_name: string
  scheme: string
  plan: string
  provider: string
  location: string
  cost: number
  utilization_rate: number
  balance: number
  [key: string]: any
}

export interface UtilizationByEnrolleeTopService {
  [key: string]: any
}

const EMPTY_UTIL_BY_ENROLLEE_SUMMARY: UtilizationByEnrolleeSummary = {
  total_premium: 0,
  total_utilization_amount: 0,
  utilization_used: 0,
  balance: 0,
}

export function useUtilizationByEnrollee(
  filters: UtilizationFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-enrolee", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationByEnrolleeSummary,
        UtilizationByEnrolleeListItem,
        UtilizationByEnrolleeTopService
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        patient_id: filters.patient_id ?? "",
        patient_name: filters.patient_name ?? "",
        plan_id: filters.plan_id ?? "",
        plan: filters.plan ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
      }

      const normalized = await fetchReport<
        UtilizationByEnrolleeSummary,
        UtilizationByEnrolleeListItem,
        UtilizationByEnrolleeTopService
      >({
        endpoint: "fetch-utilization-by-enrolee",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_UTIL_BY_ENROLLEE_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   D) Utilization by Diagnosis
---------------------------- */

export interface UtilizationDiagnosisSummary {
  [key: string]: any
}
export interface UtilizationDiagnosisListItem {
  [key: string]: any
}
export interface UtilizationDiagnosisTopService {
  [key: string]: any
}

const EMPTY_UTILIZATION_DIAGNOSIS_SUMMARY: UtilizationDiagnosisSummary = {}

export type UtilizationDiagnosisFilters = BaseReportFilters & {
  service?: string
  location?: string
  scheme?: string
  plan?: string
  diagnosis?: string
}

export function useUtilizationByDiagnosis(
  filters: UtilizationDiagnosisFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-diagnosis", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationDiagnosisSummary,
        UtilizationDiagnosisListItem,
        UtilizationDiagnosisTopService
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        service: filters.service ?? "",
        location: filters.location ?? "",
        scheme: filters.scheme ?? "",
        plan: filters.plan ?? "",
        diagnosis: filters.diagnosis ?? "",
      }

      const normalized = await fetchReport<
        UtilizationDiagnosisSummary,
        UtilizationDiagnosisListItem,
        UtilizationDiagnosisTopService
      >({
        endpoint: "fetch-utilization-by-diagnosis",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_UTILIZATION_DIAGNOSIS_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   E) Utilization by Organization
---------------------------- */

export interface UtilizationByOrganizationSummary {
  [key: string]: any
}
export interface UtilizationByOrganizationListItem {
  [key: string]: any
}
export interface UtilizationByOrganizationTopService {
  [key: string]: any
}

const EMPTY_UTIL_BY_ORG_SUMMARY: UtilizationByOrganizationSummary = {}

export type UtilizationByOrganizationFilters = BaseReportFilters & {
  service?: string
  location?: string
  scheme?: string
  plan?: string
  cost_range?: string
}

export function useUtilizationByOrganization(
  filters: UtilizationByOrganizationFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-organization", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationByOrganizationSummary,
        UtilizationByOrganizationListItem,
        UtilizationByOrganizationTopService
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        service: filters.service ?? "",
        location: filters.location ?? "",
        scheme: filters.scheme ?? "",
        plan: filters.plan ?? "",
        cost_range: filters.cost_range ?? "",
      }

      const normalized = await fetchReport<
        UtilizationByOrganizationSummary,
        UtilizationByOrganizationListItem,
        UtilizationByOrganizationTopService
      >({
        endpoint: "fetch-utilization-by-organization",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_UTIL_BY_ORG_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   F) Utilization by Services
---------------------------- */

export interface UtilizationByServicesSummary {
  total_number_of_services: number
  total_claims_amount: number
  average_service_cost: number
  most_used_service: string
}

export interface UtilizationByServicesListItem {
  service_name: string
  enrolee_id: string
  enrolee_name: string
  provider: string
  location: string
  cost: number
  [key: string]: any
}

export interface UtilizationByServicesTopService {
  service_name: string
  enrolee_count: number | null
  utilization: number
  [key: string]: any
}

const EMPTY_UTIL_BY_SERVICES_SUMMARY: UtilizationByServicesSummary = {
  total_number_of_services: 0,
  total_claims_amount: 0,
  average_service_cost: 0,
  most_used_service: "",
}
export type MonthlyStatisticsItem = {
  month: number
  month_name: string
  year: number
  services: Array<{ service_name: string; utilization: number }>
}

export function useUtilizationByServices(
  filters: UtilizationFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-services", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationByServicesSummary,
        UtilizationByServicesListItem,
        UtilizationByServicesTopService,
        { monthly_statistics: MonthlyStatisticsItem[] }
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        patient_id: filters.patient_id ?? "",
        patient_name: filters.patient_name ?? "",
        plan_id: filters.plan_id ?? "",
        plan: filters.plan ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
      }

      const normalized = await fetchReport<
        UtilizationByServicesSummary,
        UtilizationByServicesListItem,
        UtilizationByServicesTopService,
        { monthly_statistics: MonthlyStatisticsItem[] }
      >({
        endpoint: "fetch-utilization-by-services",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          summary: {
            ...EMPTY_UTIL_BY_SERVICES_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          monthly_statistics: Array.isArray(
            (normalized.data as any)?.monthly_statistics
          )
            ? (normalized.data as any).monthly_statistics
            : [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}
/* ----------------------------
   G) Utilization by Location (INCLUDES state_statistics)
---------------------------- */

export interface UtilizationByLocationStateStat {
  state: string
  provider_count: number
  enrolee_count: number
  total_utilization: number
}

export interface UtilizationByLocationSummary {
  total_number_of_providers: number
  total_claims_amount: number
  approved_claims_amount: number
  rejected_claims_amount: number
}

export interface UtilizationByLocationListItem {
  location: string
  scheme: string
  provider: string
  plan: string
  claims_cover: number
  number_of_enrolees: number
  approved_claims_amount: number
  [key: string]: any
}

export interface UtilizationByLocationTopService {
  [key: string]: any
}

const EMPTY_UTIL_BY_LOCATION_SUMMARY: UtilizationByLocationSummary = {
  total_number_of_providers: 0,
  total_claims_amount: 0,
  approved_claims_amount: 0,
  rejected_claims_amount: 0,
}

export type UtilizationByLocationFilters = UtilizationFilters & {
  service?: string
  location?: string // IMPORTANT: should be state code like "FCT"
  scheme?: string
  plan?: string
}

type UtilByLocationExtra = {
  state_statistics: UtilizationByLocationStateStat[]
}

export function useUtilizationByLocation(
  filters: UtilizationByLocationFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-location", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationByLocationSummary,
        UtilizationByLocationListItem,
        UtilizationByLocationTopService,
        UtilByLocationExtra
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      // IMPORTANT:
      // backend payload uses location values like "FCT".
      // Make sure `filters.location` is the same (code), not "Abuja"/"Federal Capital Territory".
      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        patient_id: filters.patient_id ?? "",
        patient_name: filters.patient_name ?? "",
        plan_id: filters.plan_id ?? "",
        plan: filters.plan ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        service: filters.service ?? "",
        location: filters.location ?? "",
        scheme: filters.scheme ?? "",
        plan_filter: (filters as any).plan_filter ?? "", // harmless if ignored
      }

      const normalized = await fetchReport<
        UtilizationByLocationSummary,
        UtilizationByLocationListItem,
        UtilizationByLocationTopService,
        UtilByLocationExtra
      >({
        endpoint: "fetch-utilization-by-location",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_UTIL_BY_LOCATION_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          state_statistics: Array.isArray(
            (normalized.data as any)?.state_statistics
          )
            ? ((normalized.data as any)
                .state_statistics as UtilizationByLocationStateStat[])
            : [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   H) Utilization by Provider
---------------------------- */

export interface UtilizationByProviderSummary {
  total_number_of_providers: number
  total_cost: number
  total_requests: number
  average_approval_rate: number
}

export interface UtilizationByProviderListItem {
  provider_name: string
  location: string
  patient_count: number
  number_of_requests: number
  total_cost: number
  average_cost_per_enrollee: number
  [key: string]: any
}

export interface UtilizationByProviderTopService {
  [key: string]: any
}

const EMPTY_UTIL_BY_PROVIDER_SUMMARY: UtilizationByProviderSummary = {
  total_number_of_providers: 0,
  total_cost: 0,
  total_requests: 0,
  average_approval_rate: 0,
}
export type ProviderMonthlyStat = {
  month: number
  month_name: string
  year: number
  request_count: number
  request_amount: number
}

export type ProviderTopProvider = {
  provider_name: string
  total_claims: number
  provider_code?: string
  logo_url?: string
}
export function useUtilizationByProvider(
  filters: UtilizationFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-provider", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationByProviderSummary,
        UtilizationByProviderListItem,
        UtilizationByProviderTopService,
        {
          monthly_statistics: ProviderMonthlyStat[]
          top_providers: ProviderTopProvider[]
        }
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        patient_id: filters.patient_id ?? "",
        patient_name: filters.patient_name ?? "",
        plan_id: filters.plan_id ?? "",
        plan: filters.plan ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
      }

      const normalized = await fetchReport<
        UtilizationByProviderSummary,
        UtilizationByProviderListItem,
        UtilizationByProviderTopService
      >({
        endpoint: "fetch-utilization-by-provider",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_UTIL_BY_PROVIDER_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          monthly_statistics: Array.isArray(
            (normalized.data as any)?.monthly_statistics
          )
            ? (normalized.data as any).monthly_statistics
            : [],
          top_providers: Array.isArray((normalized.data as any)?.top_providers)
            ? (normalized.data as any).top_providers
            : [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   I) Utilization by Scheme
---------------------------- */

export interface UtilizationBySchemeSummary {
  [key: string]: any
}
export interface UtilizationBySchemeListItem {
  [key: string]: any
}
export interface UtilizationBySchemeTopService {
  [key: string]: any
}
export type SchemeMonthlyStat = {
  month: number
  month_name: string
  year: number
  schemes: Array<{
    scheme: string
    enrolee_count: number | null
    total_cost?: number | null
    total_requests?: number | null
  }>
}
const EMPTY_UTIL_BY_SCHEME_SUMMARY: UtilizationBySchemeSummary = {}

export function useUtilizationByScheme(
  filters: UtilizationFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-utilization-by-scheme", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        UtilizationBySchemeSummary,
        UtilizationBySchemeListItem,
        UtilizationBySchemeTopService,
        { monthly_statistics: SchemeMonthlyStat[] }
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        patient_id: filters.patient_id ?? "",
        patient_name: filters.patient_name ?? "",
        plan_id: filters.plan_id ?? "",
        plan: filters.plan ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
      }

      const normalized = await fetchReport<
        UtilizationBySchemeSummary,
        UtilizationBySchemeListItem,
        UtilizationBySchemeTopService,
        { monthly_statistics: SchemeMonthlyStat[] }
      >({
        endpoint: "fetch-utilization-by-scheme",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_UTIL_BY_SCHEME_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          monthly_statistics: Array.isArray(
            (normalized.data as any)?.monthly_statistics
          )
            ? (normalized.data as any).monthly_statistics
            : [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}

/* ----------------------------
   J) Overdue report
---------------------------- */

export interface OverdueReportSummary {
  total_overdue_requests?: number
  total_cost?: number
  average_days_overdue?: number
  [key: string]: any
}

export interface OverdueReportListItem {
  request_id?: string
  enrollee_name?: string
  provider_name?: string
  scheme?: string
  submitted_date?: string
  submitted_time?: string
  days_overdue?: number
  total_cost?: number
  [key: string]: any
}

export interface OverdueReportTopService {
  [key: string]: any
}

const EMPTY_OVERDUE_SUMMARY: OverdueReportSummary = {
  total_overdue_requests: 0,
  total_cost: 0,
  average_days_overdue: 0,
}

export type OverdueReportFilters = BaseReportFilters & {
  service?: string
  location?: string
  scheme?: string
  plan?: string
}

export function useOverdueReport(
  filters: OverdueReportFilters = {},
  options?: Pick<UseQueryOptions<any>, "enabled">
) {
  const key = stableKey(filters)

  return useQuery({
    queryKey: ["reports", "fetch-overdue-report", key],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<
      ReportResponse<
        OverdueReportSummary,
        OverdueReportListItem,
        OverdueReportTopService
      >
    > => {
      const page = filters.page ?? 1
      const limit = filters.limit ?? 20

      const body = {
        page,
        limit,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        service: (filters as any).service ?? "",
        location: (filters as any).location ?? "",
        scheme: (filters as any).scheme ?? "",
        plan: (filters as any).plan ?? "",
      }

      const normalized = await fetchReport<
        OverdueReportSummary,
        OverdueReportListItem,
        OverdueReportTopService
      >({
        endpoint: "fetch-overdue-report",
        body,
        page,
        limit,
      })

      return {
        ...normalized,
        data: {
          ...(normalized.data as any),
          summary: {
            ...EMPTY_OVERDUE_SUMMARY,
            ...(normalized.data?.summary ?? {}),
          },
          line_listing: normalized.data?.line_listing ?? [],
          top_services: normalized.data?.top_services ?? [],
          pagination:
            normalized.data?.pagination ?? makeEmptyPagination(page, limit),
        },
      }
    },
  })
}
