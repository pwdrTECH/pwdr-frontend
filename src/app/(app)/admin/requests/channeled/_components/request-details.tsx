"use client"

import * as React from "react"
import dayjs from "dayjs"
import { toast } from "sonner"
import { z } from "zod"
import {
  useForm,
  Controller,
  type SubmitHandler,
  useWatch,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray } from "react-hook-form"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRequestDetails } from "@/lib/api/requests"
import { useCreateNewClaim, type NewClaimPayload } from "@/lib/api/claims"
import type { RequestItem, RequestStatus } from "./types"
import {
  CopyIcon,
  PaperClipIcon,
  SendIcon,
  WhatsAppIcon,
} from "@/components/svgs"
import Label from "@/components/form/label"
import { PlusIcon } from "lucide-react"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function pickStr(...vals: any[]) {
  for (const v of vals) {
    const s = String(v ?? "").trim()
    if (s) return s
  }
  return ""
}

function asNumber(x: any, fallback = 0) {
  const n = Number(x)
  return Number.isFinite(n) ? n : fallback
}

function mapClaimStatusToRequestStatus(status?: string | null): RequestStatus {
  const s = String(status ?? "").toLowerCase()
  if (s === "queried") return "overdue"
  if (s === "processed" || s === "approved") return "resolved"
  if (s === "completed") return "completed"
  return "pending"
}

function safeTimeFrom(input: any) {
  const raw = String(input ?? "").trim()
  if (!raw) return ""
  const asNum = Number(raw)
  if (Number.isFinite(asNum) && asNum > 0) {
    const d = dayjs(asNum < 10_000_000_000 ? asNum * 1000 : asNum)
    return d.isValid() ? d.format("h:mmA") : ""
  }
  const d = dayjs(raw)
  return d.isValid() ? d.format("h:mmA") : ""
}

function safeDateInputValue(input: any) {
  const raw = String(input ?? "").trim()
  if (!raw) return dayjs().format("YYYY-MM-DD")
  const asNum = Number(raw)
  if (Number.isFinite(asNum) && asNum > 0) {
    const d = dayjs(asNum < 10_000_000_000 ? asNum * 1000 : asNum)
    return d.isValid() ? d.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
  }
  const d = dayjs(raw)
  return d.isValid() ? d.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type RequestDetailsApiResponse = {
  status?: boolean | string | number
  message?: string
  data?: {
    claim?: any
    enrolee?: any
    services?: any[]
    summary?: any
    recent_claims?: any[]
    provider?: any
    [k: string]: any
  }
  [k: string]: any
}

type RequestDetailParams = {
  claim_id?: number
  tracking_number?: string
}

interface RequestDetailsProps {
  requestId?: string
  selected?: RequestItem | null
}

/* -------------------------------------------------------------------------- */
/* Fill Request Form (RHF + Zod)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Define schema first, then infer type from it
 */
const serviceLineSchema = z.object({
  category: z.string().min(1, "Select a category"),
  serviceId: z.string().min(1, "Select a service"),
  quantity: z.number().int().positive("Enter quantity"),
  tariff: z.number().nonnegative(),
})

const fillRequestSchema = z.object({
  enrolleeId: z.string().min(1, "Enrollee ID is required"),
  encounterDate: z.string().min(1, "Encounter date is required"),
  enrolleeName: z.string().min(1, "Enrollee name is required"),
  scheme: z.string().min(1, "Scheme is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  remarks: z.string().optional(),
  services: z.array(serviceLineSchema).min(1, "Add at least one service"),
})

// Infer the type from the schema
type FillRequestFormValues = z.infer<typeof fillRequestSchema>

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ChanneledRequestDetails({
  requestId,
  selected,
}: RequestDetailsProps) {
  const [assignedTo, setAssignedTo] = React.useState<string>("")
  const [showFillRequest, setShowFillRequest] = React.useState(false)

  const createClaimMutation = useCreateNewClaim()

  const claimKey = selected?.id ?? requestId
  const detailParams: RequestDetailParams | undefined = React.useMemo(() => {
    if (!claimKey) return undefined
    const n = Number(claimKey)
    if (!Number.isNaN(n)) return { claim_id: n }
    return { tracking_number: String(claimKey) }
  }, [claimKey])

  const q = useRequestDetails(detailParams ?? {}) as {
    data?: RequestDetailsApiResponse
    isLoading?: boolean
    error?: unknown
  }

  const api = q.data?.data
  const claim = api?.claim
  const enrollee = api?.enrolee
  const provider = api?.provider ?? claim?.provider
  const plan = claim?.plan
  const recentClaims = Array.isArray(api?.recent_claims)
    ? api.recent_claims
    : []

  // Service catalog from API
  const rawServices = Array.isArray(api?.services) ? api.services : []

  const providerName = pickStr(provider?.name, selected?.name)
  const providerPhone = pickStr(
    provider?.phone,
    claim?.provider_phone,
    selected?.organization,
  )
  const providerProfileImage = provider?.image ?? ""

  const enrolleeName =
    pickStr(
      `${enrollee?.first_name ?? ""} ${enrollee?.surname ?? ""}`.trim(),
      enrollee?.enrolee_name,
      claim?.enrolee_name,
    ) || "—"

  const enrolleeId = pickStr(
    enrollee?.enrolee_id,
    enrollee?.enrollee_id,
    claim?.enrollee_code,
    "—",
  )
  const planName = pickStr(plan?.name, claim?.plan_name, "—")

  const claimCode = pickStr(claim?.tracking_number, claim?.id, selected?.id)
  const claimDate = pickStr(
    claim?.encounter_date,
    claim?.created_at,
    claim?.date_created,
    "",
  )

  const diagnosis = pickStr(claim?.diagnosis, "—")
  const shortCategory = pickStr(
    claim?.category,
    claim?.benefit,
    claim?.claim_type,
  )

  const statusCode = mapClaimStatusToRequestStatus(claim?.status)
  const isResolvedLike = statusCode === "resolved" || statusCode === "completed"

  // Bubble
  const bubbleTitle =
    `${claimCode}${shortCategory ? ` (${shortCategory})` : ""}`.trim()
  const bubbleBody = [
    pickStr(enrolleeName),
    pickStr(enrolleeId),
    diagnosis ? `DIAG: ${diagnosis}` : "",
  ]
    .filter(Boolean)
    .join(", ")

  // Chips
  const chips: string[] = [
    pickStr(claimCode),
    pickStr(enrolleeName),
    pickStr(enrolleeId),
    pickStr(diagnosis),
    pickStr(shortCategory),
    pickStr(claimDate),
  ].filter((x, i, arr) => Boolean(x) && arr.indexOf(x) === i)

  /* ----------------------------- */
  /* Normalize service catalog      */
  /* ----------------------------- */
  const SERVICE_OPTIONS = React.useMemo(() => {
    return rawServices
      .map((s: any) => {
        const id = pickStr(s?.id, s?.service_id, s?.code)
        const name = pickStr(s?.name, s?.service_name, s?.title, s?.service)
        const category = pickStr(
          s?.category,
          s?.service_category,
          s?.category_name,
          s?.group,
          "General",
        )
        const tariff = asNumber(
          s?.tariff ?? s?.rate ?? s?.price ?? s?.amount ?? s?.cost,
          0,
        )
        return {
          id: String(id),
          name: String(name),
          category: String(category),
          tariff,
        }
      })
      .filter((x) => x.id && x.name)
  }, [rawServices])

  const CATEGORY_OPTIONS = React.useMemo(() => {
    const set = new Set<string>()
    for (const s of SERVICE_OPTIONS) set.add(s.category || "General")
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [SERVICE_OPTIONS])

  const servicesByCategory = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; tariff: number }[]
    >()
    for (const s of SERVICE_OPTIONS) {
      const key = s.category || "General"
      const arr = map.get(key) ?? []
      arr.push({ id: s.id, name: s.name, tariff: s.tariff })
      map.set(key, arr)
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.name.localeCompare(b.name))
      map.set(k, arr)
    }
    return map
  }, [SERVICE_OPTIONS])

  /* ----------------------------- */
  /* RHF form                       */
  /* ----------------------------- */

  const form = useForm<FillRequestFormValues>({
    resolver: zodResolver(fillRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      enrolleeId: "",
      encounterDate: dayjs().format("YYYY-MM-DD"),
      enrolleeName: "",
      scheme: "",
      diagnosis: "",
      remarks: "",
      services: [
        { category: "", serviceId: "", quantity: 1, tariff: 0 },
        { category: "", serviceId: "", quantity: 1, tariff: 0 },
      ],
    } as FillRequestFormValues,
  })

  const { control, handleSubmit, reset, setValue, watch, formState } = form
  const { errors, isSubmitting } = formState

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  })

  // Memoize reset payload
  const resetPayload = React.useMemo<FillRequestFormValues>(
    () => ({
      enrolleeId: pickStr(enrolleeId, ""),
      encounterDate: safeDateInputValue(claimDate),
      enrolleeName: pickStr(enrolleeName, ""),
      scheme: pickStr(planName, ""),
      diagnosis: pickStr(diagnosis === "—" ? "" : diagnosis, ""),
      remarks: "",
      services: [{ category: "", serviceId: "", quantity: 1, tariff: 0 }],
    }),
    [enrolleeId, claimDate, enrolleeName, planName, diagnosis],
  )

  React.useEffect(() => {
    reset(resetPayload)
    setShowFillRequest(false)
  }, [reset, resetPayload])

  const onSubmitFillRequest: SubmitHandler<FillRequestFormValues> = async (
    values,
  ) => {
    try {
      // Build the NewClaimPayload according to the expected schema
      const newClaimPayload: NewClaimPayload = {
        provider_id: asNumber(provider?.id ?? claim?.provider_id, 0),
        enrolee_id: values.enrolleeId,
        plan_id: asNumber(plan?.id ?? claim?.plan_id, 0),
        channel: pickStr(claim?.channel, "WhatsApp"),
        encounter_date: values.encounterDate,
        diagnosis: values.diagnosis,
        prescription: undefined,
        radiology: undefined,
        lab: undefined,
        services: values.services.map((s) => ({
          item_id: asNumber(s.serviceId, 0),
          item_type: s.category,
          quantity: s.quantity,
          cost: asNumber(s.tariff, 0),
        })),
      }

      console.log("[v0] Submitting new claim with payload:", newClaimPayload)

      // Call the mutation to create the claim
      await createClaimMutation.mutateAsync(newClaimPayload)

      toast.success("Claim submitted successfully!")
      setShowFillRequest(false)
      reset(resetPayload)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit claim"
      console.error("[v0] Claim submission error:", error)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="flex-1 flex gap-6">
      {/* CENTER COLUMN */}
      <div className="flex-1 rounded-3xl border border-[#EAECF0] bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-[#E5E5E540] h-[74px] px-6 py-4 border-b border-[#EAECF0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarImage src={providerProfileImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-[#4845D233] text-[#101828]">
                {providerName?.slice(0, 1)?.toUpperCase() || ""}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex gap-4 items-baseline">
                <p className="text-[14px]/[20px] font-hnd font-semibold text-[#344054] truncate">
                  {providerName || "—"}
                </p>

                <button
                  type="button"
                  className="text-[#344054] hover:text-[#667085] cursor-pointer"
                  aria-label="Copy name"
                  onClick={() => {
                    navigator.clipboard?.writeText(providerName ?? "")
                    toast.success("Name copied")
                  }}
                >
                  <CopyIcon className="text-inherit" />
                </button>
              </div>

              <p className="font-medium font-hnd text-[14px]/[18px] text-[#959595] truncate">
                {providerPhone || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-4 pr-1 pl-4 flex flex-col gap-1.75">
          <div className="flex flex-col gap-4">
            <div className="font-medium font-hnd text-center text-[#7B7B7B] text-[14px]/[24px]">
              Today
            </div>

            {/* Message bubble */}
            <div className="w-full bg-[#F1F1F1A3] rounded-2xl pt-4 pb-2 px-4 flex flex-col gap-3">
              <div className="text-[16px]/[24px] font-hnd font-normal text-[#3A3D40]">
                <p>{bubbleTitle || "—"}</p>
                <span className="mt-2 text-[16px]/[24px] text-[#3A3D40] whitespace-pre-line">
                  {bubbleBody || "—"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[14px]/[24px] text-[#7B7B7B]">
                <WhatsAppIcon />
                <span>{safeTimeFrom(claimDate) || "—"}</span>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {chips.slice(0, 10).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-2 bg-[#E8E8E857] rounded-[6px] border border-[#B1B1B11A] p-2 text-[14px]/[155%] text-[#2D2D2D] tracking-normal"
                >
                  <button
                    type="button"
                    className="text-[#646668] hover:text-[#667085] cursor-pointer"
                    aria-label={`Copy ${c}`}
                    onClick={() => {
                      navigator.clipboard?.writeText(c)
                      toast.success(`${c} copied`)
                    }}
                  >
                    <CopyIcon className="text-inherit" />
                  </button>
                  {c}
                </span>
              ))}
            </div>

            {/* Fill Request / Approved Panel */}
            <div className="mt-8">
              {!isResolvedLike ? (
                <div className="flex justify-center">
                  {showFillRequest && !isResolvedLike ? null : (
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl py-2 px-[14px] border border-[#D0D5DD] hover:bg-transparent text-[14px]/[20px] text-[#344054] hover:text-[#344054] tracking-normal bg-transparent"
                      onClick={() => setShowFillRequest((v) => !v)}
                    >
                      Fill Request
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#B2DDFF] bg-[#EDF5FF] p-6">
                  <p className="text-[16px]/[24px] font-hnd font-semibold text-[#101828]">
                    Request is Approved and Eligible for claims
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[12px]/[18px] text-[#667085]">
                        Date &amp; Time
                      </p>
                      <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828]">
                        {claimDate || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px]/[18px] text-[#667085]">
                        Enrollee&apos;s ID
                      </p>
                      <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828]">
                        {enrolleeId || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px]/[18px] text-[#667085]">
                        Scheme
                      </p>
                      <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828]">
                        {planName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px]/[18px] text-[#667085]">
                        Diagnosis
                      </p>
                      <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828]">
                        {diagnosis || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FILL REQUEST FORM + SERVICES */}
              {showFillRequest && !isResolvedLike && (
                <form
                  id="fill-request-form"
                  className="mt-6 rounded-2xl border border-[#EAECF0] bg-white p-6"
                  onSubmit={handleSubmit(onSubmitFillRequest)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[16px]/[24px] font-hnd font-semibold text-[#101828]">
                      Fill Request
                    </p>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border border-[#E4E7EC] text-[#667085]"
                      onClick={() => setShowFillRequest(false)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Top fields */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                        Enrollee&apos;s ID
                      </Label>
                      <Controller
                        control={control}
                        name="enrolleeId"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className={cn(
                              "h-[44px] rounded-xl border",
                              errors.enrolleeId
                                ? "border-red-500"
                                : "border-[#E4E7EC]",
                            )}
                            placeholder="Paste here"
                          />
                        )}
                      />
                      {errors.enrolleeId && (
                        <p className="mt-1 text-xs text-red-600">
                          {String(errors.enrolleeId.message)}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                        Encounter date
                      </Label>
                      <Controller
                        control={control}
                        name="encounterDate"
                        render={({ field }) => (
                          <Input
                            type="date"
                            {...field}
                            className={cn(
                              "h-[44px] rounded-xl border",
                              errors.encounterDate
                                ? "border-red-500"
                                : "border-[#E4E7EC]",
                            )}
                          />
                        )}
                      />
                      {errors.encounterDate && (
                        <p className="mt-1 text-xs text-red-600">
                          {String(errors.encounterDate.message)}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                        Enrollee Name
                      </Label>
                      <Controller
                        control={control}
                        name="enrolleeName"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className={cn(
                              "h-[44px] rounded-xl border",
                              errors.enrolleeName
                                ? "border-red-500"
                                : "border-[#E4E7EC]",
                            )}
                            placeholder="Paste here"
                          />
                        )}
                      />
                      {errors.enrolleeName && (
                        <p className="mt-1 text-xs text-red-600">
                          {String(errors.enrolleeName.message)}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                        Scheme
                      </Label>
                      <Controller
                        control={control}
                        name="scheme"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className={cn(
                              "h-[44px] rounded-xl border",
                              errors.scheme
                                ? "border-red-500"
                                : "border-[#E4E7EC]",
                            )}
                            placeholder="Paste here"
                          />
                        )}
                      />
                      {errors.scheme && (
                        <p className="mt-1 text-xs text-red-600">
                          {String(errors.scheme.message)}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                        Diagnosis
                      </Label>
                      <Controller
                        control={control}
                        name="diagnosis"
                        render={({ field }) => (
                          <Input
                            {...field}
                            className={cn(
                              "h-[44px] rounded-xl border",
                              errors.diagnosis
                                ? "border-red-500"
                                : "border-[#E4E7EC]",
                            )}
                            placeholder="Paste here"
                          />
                        )}
                      />
                      {errors.diagnosis && (
                        <p className="mt-1 text-xs text-red-600">
                          {String(errors.diagnosis.message)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SERVICES */}
                  <div className="mt-6">
                    <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828]">
                      Services
                    </p>

                    {errors.services?.message && (
                      <p className="mt-1 text-xs text-red-600">
                        {String(errors.services.message)}
                      </p>
                    )}

                    <div className="mt-4 space-y-4">
                      {fields.map((f, idx) => {
                        const cat = watch(`services.${idx}.category`)
                        const list = servicesByCategory.get(cat || "") ?? []

                        return (
                          <div
                            key={f.id}
                            className="rounded-2xl border border-[#E4E7EC] bg-white p-5"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-[18px]/[24px] font-hnd font-semibold text-[#101828]">
                                Service {idx + 1}
                              </p>

                              <button
                                type="button"
                                className="h-6 w-6 rounded-xl border-[1.5px] border-[#98A2B3] text-[#98A2B3] flex items-center justify-center"
                                onClick={() => remove(idx)}
                                disabled={fields.length <= 1}
                                title={
                                  fields.length <= 1
                                    ? "At least one service is required"
                                    : "Remove"
                                }
                              >
                                –
                              </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                              {/* Category */}
                              <div className="col-span-2">
                                <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                                  Service Category
                                </Label>

                                <Controller
                                  control={control}
                                  name={`services.${idx}.category`}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value}
                                      onValueChange={(v) => {
                                        field.onChange(v)
                                        setValue(
                                          `services.${idx}.serviceId`,
                                          "",
                                        )
                                        setValue(`services.${idx}.tariff`, 0)
                                      }}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          "h-[44px] w-full rounded-xl border",
                                          errors.services?.[idx]?.category
                                            ? "border-red-500"
                                            : "border-[#E4E7EC]",
                                        )}
                                      >
                                        <SelectValue placeholder="Select Category" />
                                      </SelectTrigger>

                                      <SelectContent>
                                        {CATEGORY_OPTIONS.map((c) => (
                                          <SelectItem key={c} value={c}>
                                            {c}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />

                                {errors.services?.[idx]?.category && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {String(
                                      errors.services[idx]?.category?.message,
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* Service */}
                              <div className="col-span-2">
                                <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                                  Service
                                </Label>

                                <Controller
                                  control={control}
                                  name={`services.${idx}.serviceId`}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value}
                                      onValueChange={(v) => {
                                        field.onChange(v)
                                        const svc = list.find((x) => x.id === v)
                                        setValue(
                                          `services.${idx}.tariff`,
                                          svc?.tariff ?? 0,
                                          {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                          },
                                        )
                                      }}
                                      disabled={!cat}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          "h-[44px] w-full rounded-xl border",
                                          errors.services?.[idx]?.serviceId
                                            ? "border-red-500"
                                            : "border-[#E4E7EC]",
                                        )}
                                      >
                                        <SelectValue placeholder="Select Services" />
                                      </SelectTrigger>

                                      <SelectContent>
                                        {list.map((s) => (
                                          <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />

                                {errors.services?.[idx]?.serviceId && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {String(
                                      errors.services[idx]?.serviceId?.message,
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* Quantity */}
                              <div className="col-span-1">
                                <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                                  Quantity
                                </Label>
                                <Controller
                                  control={control}
                                  name={`services.${idx}.quantity`}
                                  render={({ field }) => (
                                    <Input
                                      type="number"
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        const quantity =
                                          val === "" ? 1 : Number(val)
                                        field.onChange(quantity)

                                        // Get the current tariff base value from the service
                                        const currentTariff = watch(
                                          `services.${idx}.tariff`,
                                        )
                                        const serviceId = watch(
                                          `services.${idx}.serviceId`,
                                        )
                                        const selectedService = list.find(
                                          (x) => x.id === serviceId,
                                        )
                                        const baseTariff =
                                          selectedService?.tariff ??
                                          currentTariff ??
                                          0

                                        // Calculate new tariff = base tariff * quantity
                                        const calculatedTariff =
                                          baseTariff * quantity
                                        setValue(
                                          `services.${idx}.tariff`,
                                          calculatedTariff,
                                          {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                          },
                                        )
                                      }}
                                      className={cn(
                                        "h-[44px] rounded-xl border",
                                        errors.services?.[idx]?.quantity
                                          ? "border-red-500"
                                          : "border-[#E4E7EC]",
                                      )}
                                      placeholder="Paste here"
                                    />
                                  )}
                                />
                                {errors.services?.[idx]?.quantity && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {String(
                                      errors.services[idx]?.quantity?.message,
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* Tariff */}
                              <div className="col-span-1">
                                <Label className="block text-[12px]/[18px] text-[#667085] mb-1">
                                  Tariff
                                </Label>
                                <Controller
                                  control={control}
                                  name={`services.${idx}.tariff`}
                                  render={({ field }) => (
                                    <Input
                                      readOnly
                                      className="h-[44px] rounded-xl border border-[#E4E7EC]"
                                      value={
                                        field.value
                                          ? `₦ ${Number(field.value).toLocaleString()}`
                                          : ""
                                      }
                                      placeholder="₦ 0"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="w-full text-[14px]/[20px] font-hnd font-semibold text-[#344054] flex items-center gap-2 justify-between cursor-pointer"
                        onClick={() =>
                          append({
                            category: "",
                            serviceId: "",
                            quantity: 1,
                            tariff: 0,
                          })
                        }
                      >
                        Add New Service <PlusIcon />
                      </button>

                      {SERVICE_OPTIONS.length === 0 && (
                        <span className="text-xs text-[#98A2B3]">
                          No services returned from API
                        </span>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Composer Bar */}
        <div className="border-t border-[#E4E7EC] p-4">
          <div className="h-12 flex items-center justify-between   gap-3">
            <div className="h-12 px-4 py-3 flex-1 flex items-center rounded-2xl bg-[#F2F4F7] border border-[#EAECF0]">
              <PaperClipIcon />
              <Controller
                control={control}
                name="remarks"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="w-full resize-none rounded-xl border border-none px-3 py-2 text-[14px] outline-none placeholder:text-[#98A2B3] bg-transparent shadow-none"
                    placeholder="Type remarks..."
                  />
                )}
              />
            </div>
            <Button
              type="submit"
              form={showFillRequest ? "fill-request-form" : undefined}
              disabled={
                createClaimMutation.isPending ||
                (showFillRequest ? false : true)
              }
              className="text-white tracking-normal text-[14.94px] font-inter font-semibold rounded-xl hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createClaimMutation.isPending ? "Sending..." : "Send"}{" "}
              <SendIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-[360px] flex flex-col gap-6">
        {/* Assigned to */}
        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6">
          <p className="text-[14px]/[20px] text-[#101828] font-hnd font-semibold mb-3">
            Assigned to:
          </p>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger className="h-[44px] w-full rounded-xl border border-[#E4E7EC]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hassan Garba">Hassan Garba</SelectItem>
              <SelectItem value="Muhammad Sahab">Muhammad Sahab</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enrollee Card */}
        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-[#F2F4F7] text-[#101828]">
                {enrolleeName?.slice(0, 1)?.toUpperCase() || "E"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828] truncate">
                {enrolleeName || "—"}
              </p>
              <p className="text-[12px]/[18px] text-[#667085] truncate">
                {enrolleeId || "—"}
              </p>

              <div className="mt-2 flex items-center justify-between text-[12px]/[18px] text-[#667085]">
                <span>{/* dependants */}</span>
                <span className="text-[#101828] font-hnd font-semibold">
                  {planName || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828]">
              Recent Claims ({recentClaims.length || 0})
            </p>
            <button type="button" className="text-[12px]/[18px] text-[#1671D9]">
              View All
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {(recentClaims.length ? recentClaims : [claim].filter(Boolean))
              .slice(0, 2)
              .map((c: any, idx: number) => (
                <div
                  key={`claim-${idx + 1}`}
                  className="rounded-2xl border border-[#E4E7EC] p-4"
                >
                  <p className="text-[12px]/[18px] text-[#101828] font-hnd font-semibold truncate">
                    {pickStr(c?.tracking_number, c?.id, "—")}
                  </p>
                  <p className="text-[12px]/[18px] text-[#667085] truncate">
                    {pickStr(c?.diagnosis, diagnosis, "—")}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[12px]/[18px] text-[#667085]">
                    <span>{pickStr(c?.provider_name, providerName, "—")}</span>
                    <span>
                      {pickStr(
                        c?.encounter_date,
                        c?.date_created,
                        claimDate,
                        "",
                      )}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Provider Card */}
        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6">
          <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828] mb-4">
            Provider
          </p>

          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-[#EEF4FF] text-[#1D4ED8]">
                {providerName?.slice(0, 1)?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-[14px]/[20px] font-hnd font-semibold text-[#101828] truncate">
                {providerName || "—"}
              </p>
              <p className="text-[12px]/[18px] text-[#667085] truncate">
                {pickStr(
                  provider?.code,
                  provider?.provider_code,
                  enrolleeId,
                  "—",
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-[12px]/[18px]">
            <div>
              <p className="text-[#98A2B3]">Location</p>
              <p className="text-[#101828] font-hnd font-semibold">
                {pickStr(provider?.location, provider?.address, "—")}
              </p>
            </div>
            <div>
              <p className="text-[#98A2B3]">Accepted Insurance Plans</p>
              <p className="text-[#101828] font-hnd font-semibold">
                {pickStr(provider?.accepted_plans, planName, "—")}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#E4E7EC] p-4">
            <p className="text-[12px]/[18px] text-[#98A2B3] mb-2">Contact</p>
            <div className="space-y-2 text-[12px]/[18px] text-[#101828]">
              <div className="flex items-center justify-between">
                <span>✉ {pickStr(provider?.email, "—")}</span>
                <span className="text-[#98A2B3]">⧉</span>
              </div>
              <div className="flex items-center justify-between">
                <span>☎ {providerPhone || "—"}</span>
                <span className="text-[#98A2B3]">⧉</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
