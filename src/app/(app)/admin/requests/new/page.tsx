"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronDownIcon,
  ChevronRight,
  FileIcon,
  Plus,
  Search,
} from "lucide-react"
import * as React from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { CalendarAltIcon, MinusIcon } from "@/components/svgs"
import { useBeneficiaries } from "@/lib/api/beneficiaries"
import { usePlanDetails, usePlansByScheme, useSchemes } from "@/lib/api/schemes"
import { useCreateNewClaim } from "@/lib/api/claims"
import { useProviders } from "@/lib/api/provider"

/* -----------------------------
helpers
----------------------------- */
function qtyToNumber(qty: string) {
  const m = String(qty || "").match(/\d+/)
  return m ? Number(m[0]) : 0
}

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

function buildFullName(b: any) {
  const first = pickStr(
    b?.first_name,
    b?.enrolee_first_name,
    b?.enrollee_first_name,
  )
  const last = pickStr(
    b?.surname,
    b?.last_name,
    b?.enrollee_surname,
    b?.enrollee_surname,
  )
  const full = `${first} ${last}`.trim()
  return (
    pickStr(full, b?.full_name, b?.name, b?.enrollee_name, b?.enrollee_name) ||
    "—"
  )
}

function calcAge(dob?: string | null) {
  if (!dob) return undefined
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age >= 0 ? `${age} years` : undefined
}

function normalizeRows(result: any): any[] {
  if (!result) return []
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result?.data?.data)) return result.data.data
  return []
}

function formatMoney(n: number) {
  return `N ${n.toLocaleString()}`
}

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function makeRequestId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  const pick = () => chars[Math.floor(Math.random() * chars.length)]
  return `RDU${pick()}${pick()}${pick()}/G/${pick()}${pick()}`
}

/* -----------------------------
Zod Validation Schema
----------------------------- */
const ServiceItemSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  serviceName: z.string(), // keep required
  qty: z.string().min(1, "Quantity is required"),
  rate: z.number().min(0),
})

const NewClaimFormSchema = z.object({
  providerId: z.string().min(1, "Provider is required"), // ✅ provider select
  diagnosis: z.array(z.string()).min(1, "Select at least one diagnosis"),
  encounterDate: z.string().min(1, "Encounter date is required"),
  services: z.array(ServiceItemSchema).min(1, "Add at least one service"),
})

type NewClaimFormData = z.infer<typeof NewClaimFormSchema>

/* -----------------------------
Diagnosis MultiSelect
----------------------------- */
type Option = { label: string; value: string }

function MultiSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  options: Option[]
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)

  const selectedLabels = React.useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label]))
    return value.map((v) => map.get(v) ?? v)
  }, [value, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-[49.43px] rounded-[8.97px] border bg-transparent px-[15.7px] py-[11.22px] text-[17.07px] placeholder:text-[#66666699] shadow-[0px_1.12px_2.24px_0px_#1018280D] border-[#D0D5DD] flex items-center justify-between text-left"
        >
          <span
            className={cn(
              "text-sm",
              value.length ? "text-[#101828]" : "text-[#667085]",
            )}
          >
            {value.length
              ? selectedLabels.join(", ")
              : (placeholder ?? "Select from dropdown")}
          </span>
          <ChevronDownIcon className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search diagnosis..." />
          <CommandList>
            <CommandEmpty>No diagnosis found.</CommandEmpty>
            <CommandGroup className="max-h-[240px] overflow-auto">
              {options.map((opt) => {
                const checked = value.includes(opt.value)
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      const next = checked
                        ? value.filter((x) => x !== opt.value)
                        : [...value, opt.value]
                      onChange(next)
                    }}
                  >
                    {opt.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* -----------------------------
Quantity options (UNCHANGED)
----------------------------- */
const DEFAULT_QTY_OPTIONS: Option[] = [
  { label: "1Hr", value: "1Hr" },
  { label: "1Tb", value: "1Tb" },
  { label: "1Pc", value: "1Pc" },
  { label: "2Tb", value: "2Tb" },
]

/* -----------------------------
Page
----------------------------- */
export default function NewRequestsPage() {
  const [q, setQ] = React.useState("")
  const [openSearch, setOpenSearch] = React.useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = React.useState<
    any | null
  >(null)
  const [requestId, setRequestId] = React.useState<string>(() =>
    makeRequestId(),
  )
  const [files, setFiles] = React.useState<File[]>([])

  const createClaimMutation = useCreateNewClaim()

  const [debounced, setDebounced] = React.useState("")
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250)
    return () => clearTimeout(t)
  }, [q])

  const beneficiariesQuery = useBeneficiaries({
    search: debounced,
    page: 1,
    limit: 100,
  })
  console.log("selectedBeneficiary", selectedBeneficiary)
  const beneficiaries = React.useMemo(
    () => normalizeRows(beneficiariesQuery.data),
    [beneficiariesQuery.data],
  )

  // ✅ Providers from API
  // (Adjust params to match your hook signature if needed)
  const providersQuery = useProviders({
    page: 1,
    limit: 200,
    search: "",
  } as any)
  const providers = React.useMemo(
    () => normalizeRows(providersQuery.data),
    [providersQuery.data],
  )

  const PROVIDER_OPTIONS: Option[] = React.useMemo(() => {
    return providers
      .map((p: any) => {
        const id = pickStr(p?.id, p?.provider_id, p?.hmo_id)
        const name = pickStr(p?.name, p?.provider_name, p?.hmo_name, p?.title)
        if (!id) return null
        return {
          value: String(id),
          label: name ? String(name) : `Provider ${id}`,
        }
      })
      .filter(Boolean) as Option[]
  }, [providers])

  const providersLoading = providersQuery?.isLoading

  const {
    control,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<NewClaimFormData>({
    resolver: zodResolver(NewClaimFormSchema),
    defaultValues: {
      providerId: "",
      diagnosis: [],
      encounterDate: todayISO(),
      services: [
        { serviceId: "", serviceName: "", qty: "", rate: 0 },
        { serviceId: "", serviceName: "", qty: "", rate: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  })

  const rowsForm = useWatch({ control, name: "services" }) || []

  /* ------------------------------------------------------------------
   SERVICES: beneficiary -> scheme_id/plan_id -> plan details
  ------------------------------------------------------------------ */
  useSchemes()

  const schemeId = React.useMemo(() => {
    const raw = pickStr(
      selectedBeneficiary?.scheme_id,
      selectedBeneficiary?.scheme?.id,
    )
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }, [selectedBeneficiary])

  const beneficiaryPlanId = React.useMemo(() => {
    const raw = pickStr(
      selectedBeneficiary?.plan_id,
      selectedBeneficiary?.plan?.id,
    )
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }, [selectedBeneficiary])

  const plansQuery = usePlansByScheme(schemeId)

  const selectedPlanId = React.useMemo(() => {
    if (beneficiaryPlanId) return String(beneficiaryPlanId)
    const plans = plansQuery.data ?? []
    return plans.length ? String(plans[0].id) : ""
  }, [beneficiaryPlanId, plansQuery.data])

  const planDetailsQuery = usePlanDetails(
    selectedPlanId
      ? { id: selectedPlanId, show_services: 1 }
      : { id: "", show_services: 1 },
  )

  const SERVICE_OPTIONS = React.useMemo(() => {
    const payload = planDetailsQuery.data?.data

    const services =
      payload?.services ??
      payload?.plan?.services ??
      payload?.data?.services ??
      payload?.plan_services ??
      []

    if (!Array.isArray(services)) return []

    return services
      .map((svc: any) => {
        const id = pickStr(svc?.id, svc?.service_id, svc?.code)
        const label = pickStr(
          svc?.name,
          svc?.service_name,
          svc?.title,
          svc?.service,
        )
        const rate = asNumber(
          svc?.tariff ?? svc?.rate ?? svc?.price ?? svc?.cost ?? svc?.amount,
          0,
        )
        return { id: String(id), label: String(label).trim(), rate }
      })
      .filter((x) => x.id && x.label)
  }, [planDetailsQuery.data])

  const servicesLoading =
    !!selectedBeneficiary &&
    (plansQuery.isLoading || planDetailsQuery.isLoading)

  const totalBill = React.useMemo(() => {
    return rowsForm.reduce((sum, r) => {
      const qty = qtyToNumber(r?.qty)
      const rate = Number(r?.rate || 0)
      return sum + rate * qty
    }, 0)
  }, [rowsForm])

  const header = React.useMemo(() => {
    if (!selectedBeneficiary) return null

    const fullName = buildFullName(selectedBeneficiary)
    const gender = selectedBeneficiary?.gender
      ? String(selectedBeneficiary?.gender).charAt(0).toUpperCase() +
        String(selectedBeneficiary?.gender).slice(1)
      : "—"
    const age = calcAge(selectedBeneficiary?.dob) ?? "—"
    const enrolleeId = pickStr(selectedBeneficiary?.id) || "—"

    const scheme = pickStr(selectedBeneficiary?.plan_name) || "—"

    const createdBy =
      pickStr(
        selectedBeneficiary?.provider_name,
        selectedBeneficiary?.hospital_name,
        selectedBeneficiary?.organisation,
        selectedBeneficiary?.organization,
      ) || "—"

    return { fullName, gender, age, enrolleeId, scheme, createdBy }
  }, [selectedBeneficiary])

  const searchWrapRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current) return
      if (!searchWrapRef.current.contains(e.target as Node))
        setOpenSearch(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  const pickBeneficiary = (b: any) => {
    setSelectedBeneficiary(b)
    setOpenSearch(false)
    setQ(buildFullName(b))
    setRequestId(makeRequestId())
    setFiles([])

    // ✅ set default providerId from beneficiary.hmo_id (still selectable)
    const defaultProviderId = pickStr(b?.hmo_id)

    reset({
      providerId: defaultProviderId ? String(defaultProviderId) : "",
      diagnosis: [],
      encounterDate: todayISO(),
      services: [
        { serviceId: "", serviceName: "", qty: "", rate: 0 },
        { serviceId: "", serviceName: "", qty: "", rate: 0 },
      ],
    })
  }

  const onChooseFiles = (fileList: FileList | null) => {
    if (!fileList) return
    setFiles(Array.from(fileList))
  }

  const onSubmitClaim = async (data: NewClaimFormData) => {
    if (!selectedBeneficiary) {
      toast.error("Please select an enrollee first.")
      return
    }

    try {
      const planId = pickStr(
        selectedBeneficiary?.plan_id,
        selectedBeneficiary?.plan?.id,
      )
      const enrolleeId = pickStr(selectedBeneficiary?.id)

      const payload = {
        provider_id: asNumber(data.providerId, 0),
        enrolee_id: enrolleeId,
        plan_id: asNumber(planId, 0),
        channel: "WhatsApp",
        encounter_date: data.encounterDate,
        diagnosis: data.diagnosis.join(", "),
        prescription: undefined,
        radiology: undefined,
        lab: undefined,
        services: data.services
          .filter((s) => s.serviceId && s.qty)
          .map((s) => ({
            item_id: asNumber(s.serviceId, 0),
            item_type: s.serviceName,
            quantity: qtyToNumber(s.qty),
            cost: s.rate,
          })),
      }

      console.log("[v0] Submitting new claim:", payload)
      await createClaimMutation.mutateAsync(payload)

      toast.success("Claim submitted successfully!")
      reset({
        providerId: "",
        diagnosis: [],
        encounterDate: todayISO(),
        services: [
          { serviceId: "", serviceName: "", qty: "", rate: 0 },
          { serviceId: "", serviceName: "", qty: "", rate: 0 },
        ],
      })
      setSelectedBeneficiary(null)
      setQ("")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit claim"
      console.error("[v0] Claim submission error:", error)
      toast.error(errorMessage)
    }
  }

  const DIAGNOSIS_OPTIONS: Option[] = [
    { label: "Allergic conjunctivitis", value: "allergic conjunctivitis" },
    { label: "Consultation", value: "consultation" },
    { label: "Malaria", value: "malaria" },
    { label: "Typhoid", value: "typhoid" },
  ]

  const addRow = () => {
    append({ serviceId: "", serviceName: "", qty: "", rate: 0 })
  }

  const removeRowAtIndex = (idx: number) => {
    if (fields.length > 1) remove(idx)
    else toast.error("Must keep at least one service row")
  }

  return (
    <div className="w-full h-[calc(100vh-0px)] flex flex-col">
      {/* TOP AREA */}
      <div
        className={cn(
          "w-full px-6 pt-6",
          !selectedBeneficiary && "flex-1 flex items-center justify-center",
        )}
      >
        <div
          className={cn(
            "w-full flex",
            selectedBeneficiary ? "justify-end" : "justify-center",
          )}
        >
          <div
            ref={searchWrapRef}
            className={cn("relative w-full max-w-[520px]")}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setOpenSearch(true)
                  if (selectedBeneficiary) setSelectedBeneficiary(null)
                }}
                onFocus={() => setOpenSearch(true)}
                placeholder="Enter Enrollee ID or Name"
                className="h-12 pl-14 pr-2 rounded-[12px] bg-[#F8F8F8] placeholder:text-[#666666E5] border border-[#0000000F]"
              />
              <Button
                type="button"
                onClick={() => setOpenSearch(true)}
                className="w-[43px] h-[32px] absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[#1671D9] px-0"
              >
                <ChevronRight />
              </Button>
            </div>

            {/* Dropdown */}
            {openSearch && debounced.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-[12px] border border-[#EAECF0] bg-white shadow-sm overflow-hidden">
                {beneficiariesQuery.isLoading && (
                  <div className="p-3 text-xs text-[#667085]">Searching…</div>
                )}

                {!beneficiariesQuery.isLoading &&
                  beneficiaries.length === 0 && (
                    <div className="p-3 text-xs text-[#667085]">
                      No enrollee found.
                    </div>
                  )}

                {!beneficiariesQuery.isLoading &&
                  beneficiaries.map((b: any, idx: number) => {
                    const name = buildFullName(b)
                    const scheme = pickStr(b?.plan_name)

                    return (
                      <button
                        key={String(idx)}
                        type="button"
                        onClick={() => pickBeneficiary(b)}
                        className="w-full px-3 py-3 text-left hover:bg-[#F9FAFB] border-b last:border-b-0 border-[#EAECF0]"
                      >
                        <div className="text-sm font-medium text-[#101828]">
                          {name}
                        </div>
                        {scheme && (
                          <div className="text-xs text-[#667085]">{scheme}</div>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}

            {!selectedBeneficiary && (
              <p className="mt-4 text-center text-sm text-[#667085]">
                Search enrollee to fill in an order
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 pb-[92px] overflow-y-auto">
        {header && (
          <div className="mt-6 rounded-3xl border border-[#E4E7EC] bg-white p-6">
            <div className="grid grid-cols-3 gap-10">
              <div>
                <div className="text-sm text-[#667085]">Full Name</div>
                <div className="font-semibold text-[#101828]">
                  {header.fullName}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#667085]">Gender</div>
                <div className="font-semibold text-[#101828]">
                  {header.gender}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#667085]">Age</div>
                <div className="font-semibold text-[#101828]">{header.age}</div>
              </div>

              <div>
                <div className="text-sm text-[#667085]">Enrollee ID</div>
                <div className="font-semibold text-[#101828]">
                  {header.enrolleeId}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#667085]">Request ID</div>
                <div className="font-semibold text-[#101828]">{requestId}</div>
              </div>
              <div>
                <div className="text-sm text-[#667085]">Created By</div>
                <div className="font-semibold text-[#101828]">
                  {header.createdBy}
                </div>
              </div>

              <div>
                <div className="text-sm text-[#667085]">Scheme/Plan</div>
                <div className="font-semibold text-[#101828]">
                  {header.scheme}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-[20px] font-semibold text-[#101828]">
                Enter Request Details
              </h3>
              <div className="mt-4 h-px bg-[#EAECF0]" />

              <div className="mt-6 grid grid-cols-2 gap-6">
                {/* Diagnosis */}
                <div>
                  <div className="text-sm text-[#344054] mb-2">
                    Select Diagnosis (Select Multiple if applicable)
                  </div>
                  <Controller
                    control={control}
                    name="diagnosis"
                    render={({ field }) => (
                      <MultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={DIAGNOSIS_OPTIONS}
                        placeholder="Select from dropdown"
                      />
                    )}
                  />
                  {errors.diagnosis && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.diagnosis.message}
                    </p>
                  )}
                </div>

                {/* ✅ Provider (from useProviders) */}
                <div>
                  <div className="text-sm text-[#344054] mb-2">
                    Select Provider
                  </div>
                  <Controller
                    control={control}
                    name="providerId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={providersLoading}
                      >
                        <SelectTrigger className="w-full text-primary">
                          <SelectValue
                            placeholder={
                              providersLoading
                                ? "Loading providers..."
                                : "Select provider"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDER_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.providerId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.providerId.message}
                    </p>
                  )}
                </div>

                {/* Encounter date */}
                <div>
                  <div className="text-sm text-[#344054] mb-2">
                    Select Encounter date
                  </div>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="encounterDate"
                      render={({ field }) => (
                        <Input
                          type="date"
                          value={field.value}
                          onChange={field.onChange}
                          className="appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                        />
                      )}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <CalendarAltIcon />
                    </span>
                  </div>
                  {errors.encounterDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.encounterDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Treatment Items */}
              <div className="mt-8 rounded-2xl border border-[#EAECF0] bg-white overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[18px] font-semibold text-[#101828]">
                      Treatment Items
                    </h4>
                    <Badge className="bg-[#F2F4F7] text-[#344054]">
                      {fields.length}
                    </Badge>
                    {servicesLoading && (
                      <span className="text-xs text-[#667085] ml-2">
                        Loading services…
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#667085] mt-1">
                    Enter Services/Treatment items used by enrollee
                  </p>
                </div>

                <div className="h-px bg-[#EAECF0]" />

                <div className="p-6 space-y-6">
                  {fields.map((f, idx) => {
                    const r = rowsForm[idx] ?? f
                    const amount = Number(r.rate || 0) * qtyToNumber(r.qty)

                    return (
                      <div key={f.id} className="flex justify-between gap-4">
                        {/* Service */}
                        <div>
                          <div className="text-sm text-[#344054] mb-2">
                            Service
                          </div>
                          <Controller
                            control={control}
                            name={`services.${idx}.serviceId`}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(v) => {
                                  const svc = SERVICE_OPTIONS.find(
                                    (x) => x.id === v,
                                  )
                                  field.onChange(v)
                                  if (svc) {
                                    setValue(
                                      `services.${idx}.serviceName`,
                                      svc.label,
                                      {
                                        shouldDirty: true,
                                      },
                                    )
                                    setValue(`services.${idx}.rate`, svc.rate, {
                                      shouldDirty: true,
                                    })
                                  } else {
                                    setValue(
                                      `services.${idx}.serviceName`,
                                      "",
                                      {
                                        shouldDirty: true,
                                      },
                                    )
                                  }
                                }}
                                disabled={
                                  servicesLoading ||
                                  SERVICE_OPTIONS.length === 0
                                }
                              >
                                <SelectTrigger className="w-[347px] text-primary">
                                  <SelectValue
                                    placeholder={
                                      servicesLoading
                                        ? "Loading services..."
                                        : SERVICE_OPTIONS.length
                                          ? "Select Service"
                                          : "No services available"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {SERVICE_OPTIONS.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {/* Quantity (UNCHANGED) */}
                        <div>
                          <div className="text-sm text-[#344054] mb-2">
                            Quantity
                          </div>
                          <Controller
                            control={control}
                            name={`services.${idx}.qty`}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-[122px] text-primary">
                                  <SelectValue placeholder="Qty" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEFAULT_QTY_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                      {o.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {/* Rate */}
                        <div className="w-[246px]">
                          <div className="text-sm text-[#344054] mb-2">
                            Rate
                          </div>
                          <Controller
                            control={control}
                            name={`services.${idx}.rate`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value
                                  field.onChange(val === "" ? 0 : Number(val))
                                }}
                                className="h-[44px] rounded-[12px] border border-[#D0D5DD]"
                                placeholder="Enter rate"
                              />
                            )}
                          />
                        </div>

                        {/* Amount */}
                        <div className="w-[246px]">
                          <div className="text-sm text-[#344054] mb-2">
                            Amount
                          </div>
                          <div className="h-[44px] rounded-[12px] border border-transparent flex items-center text-[#344054]">
                            {amount ? formatMoney(amount) : "—"}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeRowAtIndex(idx)}
                          className="h-10 w-10 rounded-[10px] flex items-center justify-center"
                          aria-label="Remove row"
                        >
                          <MinusIcon />
                        </button>
                      </div>
                    )
                  })}

                  {/* Add row */}
                  <button
                    type="button"
                    onClick={addRow}
                    className="h-11 w-11 rounded-xl border border-[#D0D5DD] flex items-center justify-center"
                    aria-label="Add row"
                  >
                    <span className="h-5 w-5 rounded border-[1.5px] border-[#5B636E] p-1 flex justify-center items-center">
                      <Plus className="text-[#5B636E] w-4 h-4 shrink-0" />
                    </span>
                  </button>
                </div>

                {/* Footer total */}
                <div className="bg-[#F9FAFB] border-t border-[#EAECF0] px-6 py-5 flex items-center justify-between">
                  <div className="text-sm text-[#667085]">Bill</div>
                  <div className="text-[20px] font-semibold text-[#101828]">
                    {formatMoney(totalBill || 0)}
                  </div>
                </div>
              </div>

              {/* Upload + Submit */}
              <div className="mt-10">
                <h4 className="text-[18px] font-semibold text-[#101828]">
                  Enter Request Details
                </h4>

                <div className="mt-4 bg-white">
                  <label
                    className="block w-full rounded-2xl border border-dashed border-[#D0D5DD] p-10 text-center cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      onChooseFiles(e.dataTransfer.files)
                    }}
                  >
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(e) => onChooseFiles(e.target.files)}
                    />
                    <div className="w-full flex flex-col items-center gap-2">
                      <FileIcon className="text-[#D0D5DD]" />
                      <div className="text-sm text-[#667085]">
                        Tap or drag file into box to upload
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 text-xs text-[#475467] space-y-1">
                        {files.map((f) => (
                          <div key={f.name}>{f.name}</div>
                        ))}
                      </div>
                    )}
                  </label>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSubmit(onSubmitClaim)}
                      disabled={createClaimMutation.isPending}
                      className="h-[44px] px-8 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createClaimMutation.isPending
                        ? "Submitting..."
                        : "Submit"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
