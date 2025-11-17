"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  Search,
  Trash2,
} from "lucide-react"
import * as React from "react"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { CustomSheet } from "@/components/overlays/SideDialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectField, TextField, type SelectOption } from "@/components/form"
import MailIcon, { SMSIcon, WhatsAppIcon } from "@/components/svgs"
import { CHANNEL_OPTS } from "./channel"

/* ─────────────────────────  enums  ───────────────────────── */
const BUCKETS = ["Drugs", "Labs", "Consultation", "Other"] as const
const BucketEnum = z.enum(BUCKETS)
type Bucket = (typeof BUCKETS)[number]
export const CHANNELS = ["WhatsApp", "Email", "SMS", "Web Portal"] as const
export type Channel = (typeof CHANNELS)[number]

const ChannelEnum = z.enum(CHANNELS)

// 2) metadata (icon + brand color)
export const CHANNEL_META: Record<Channel, { icon: any; color: string }> = {
  WhatsApp: { icon: WhatsAppIcon, color: "#25D366" },
  Email: { icon: MailIcon, color: "#2563EB" }, // blue
  SMS: { icon: SMSIcon, color: "#F59E0B" }, // amber
  "Web Portal": { icon: Globe, color: "#64748B" }, // slate
}
/* ────────────────────────  schema/types  ──────────────────── */
type Patient = { id: string; name: string; plan: string }
type Service = { id: string; name: string; price: number; category: Bucket }
type Eligibility = "idle" | "checking" | "eligible" | "inactive" | "error"

const itemSchema = z.object({
  serviceId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(0),
  bucket: BucketEnum,
})

const schema = z.object({
  patientId: z.string().min(1, "Enter patient ID"),
  channel: ChannelEnum,
  items: z.array(itemSchema),
})
type FormValues = z.infer<typeof schema>

/* ─────────────────────────  mocks  ────────────────────────── */
const MOCK_PATIENTS: Patient[] = [
  {
    id: "13/O/W7EZ7O",
    name: "Muhammad Sahab",
    plan: "Reliance HMO - Principal",
  },
]
const MOCK_SERVICES: Service[] = [
  {
    id: "svc1",
    name: "Drug3361 - TETANUS TOXOID INJ (₦700)",
    price: 700,
    category: "Drugs",
  },
  {
    id: "svc2",
    name: "CBC - Full Blood Count (₦3,500)",
    price: 3500,
    category: "Labs",
  },
  {
    id: "svc3",
    name: "Consultation - General (₦2,500)",
    price: 2500,
    category: "Consultation",
  },
]

async function fakeLookupPatient(id: string): Promise<Patient | null> {
  await new Promise((r) => setTimeout(r, 300))
  return (
    MOCK_PATIENTS.find((p) => p.id.toLowerCase() === id.toLowerCase()) ?? null
  )
}
async function fakeCheckEligibility(_: Patient): Promise<Eligibility> {
  await new Promise((r) => setTimeout(r, 600))
  return "eligible"
}
async function fetchServices(q: string): Promise<Service[]> {
  const query = q.trim().toLowerCase()
  await new Promise((r) => setTimeout(r, 150))
  return !query
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter((s) => s.name.toLowerCase().includes(query))
}

const BUCKET_OPTS: ReadonlyArray<SelectOption> = BUCKETS.map((b) => ({
  value: b,
  label: b,
}))

/* ───────────────────────  component  ──────────────────────── */
export default function ProcessRequest() {
  const [open, setOpen] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: "", channel: "WhatsApp", items: [] },
    mode: "onChange",
  })
  const { control, watch, setValue, handleSubmit, formState, reset } = form
  const itemsArray = useFieldArray({ control, name: "items" })

  // patient & eligibility state
  const [patient, setPatient] = React.useState<Patient | null>(null)
  const [patientFound, setPatientFound] = React.useState(false)
  const [eligibility, setEligibility] = React.useState<Eligibility>("idle")
  const [typing, setTyping] = React.useState(false)

  const patientId = watch("patientId")
  React.useEffect(() => {
    if (!patientId) {
      setPatient(null)
      setPatientFound(false)
      setEligibility("idle")
      return
    }
    setTyping(true)
    const t = setTimeout(async () => {
      const p = await fakeLookupPatient(patientId)
      setTyping(false)
      setPatient(p)
      setPatientFound(!!p)
      if (p) {
        setEligibility("checking")
        const st = await fakeCheckEligibility(p)
        setEligibility(st)
      } else {
        setEligibility("idle")
      }
    }, 250)
    return () => clearTimeout(t)
  }, [patientId])

  // create rule
  const canCreate =
    patientFound &&
    eligibility === "eligible" &&
    watch("items").some((it) => it.quantity > 0)

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (!canCreate) return
    console.log("Create request:", values)
    setOpen(false)
    reset({ patientId: "", channel: "WhatsApp", items: [] })
    setPatient(null)
    setPatientFound(false)
    setEligibility("idle")
  }
  const channel = watch("channel") as Channel | undefined

  return (
    <CustomSheet
      title="New request"
      subtitle="Send out authorization request to a patient's HMO"
      trigger={
        <Button
          variant="ghost"
          className="p-0 font-bold text-primary hover:underline"
        >
          New request
        </Button>
      }
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          reset({ patientId: "", channel: "WhatsApp", items: [] })
          setPatient(null)
          setPatientFound(false)
          setEligibility("idle")
        }
      }}
      footer={
        <div className="flex w-full items-center justify-between px-[25.6px]">
          <Button
            type="button"
            variant="outline"
            className="h-[43px] rounded-[8px] border-[#E8ECF3] text-[#3D4551]"
            onClick={() => {
              reset()
              setOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-request-form"
            className="h-[43px] rounded-[8px]"
            disabled={!canCreate || formState.isSubmitting}
          >
            {formState.isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      }
      contentClassName="px-6"
    >
      {/* pin generics so types match your form exactly */}
      <Form<FormValues> {...form}>
        <form
          id="new-request-form"
          onSubmit={handleSubmit(onSubmit)}
          className="w-full mx-auto space-y-4 sm:w-[512px]"
        >
          {/* Patient ID → custom TextField */}
          <TextField
            control={control}
            name="patientId"
            label="Patient ID"
            placeholder="Search patient"
            description={
              patientFound
                ? "Patient found!"
                : "Which patient would you like to create a request for?"
            }
            rightAdornment={
              typing || eligibility === "checking" ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
              ) : patientFound ? (
                <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
              ) : undefined
            }
          />

          {/* Patient block + eligibility chip */}
          {patient && (
            <div className="rounded-lg border bg-white p-3">
              <div className="font-medium text-[#0F172A]">{patient.name}</div>
              <div className="text-[13px] text-[#334155]">{patient.id}</div>
              <div className="text-[13px] text-[#334155]">{patient.plan}</div>

              <div className="mt-2 flex items-center gap-2 text-[13px]">
                {eligibility === "eligible" && (
                  <>
                    <span className="inline-block h-2 w-2 rounded-full bg-[#16A34A]" />
                    <span className="text-[#16A34A]">Patient eligible</span>
                  </>
                )}
                {eligibility === "inactive" && (
                  <>
                    <AlertCircle className="h-4 w-4 text-[#EF4444]" />
                    <span className="text-[#EF4444]">No active records</span>
                  </>
                )}
                {eligibility === "checking" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                    <span className="text-[#0284C7]">
                      Checking eligibility…
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="h-px w-full bg-[#E5E7EB]" />

          {/* Channel → custom SelectField */}
          <SelectField
            control={control}
            name="channel"
            label="Channel"
            options={CHANNEL_OPTS}
            triggerClassName="justify-start"
            triggerAriaLabel="Channel"
          />

          <div className="h-px w-full bg-[#E5E7EB]" />

          {/* Services (combobox search; not part of schema) */}
          <ServicesPicker
            onPick={(svc) => {
              const exists = itemsArray.fields.some(
                (f) => f.serviceId === svc.id
              )
              if (!exists) {
                itemsArray.append({
                  serviceId: svc.id,
                  name: svc.name,
                  price: svc.price,
                  quantity: 0,
                  bucket: svc.category,
                })
              }
            }}
          />

          {/* Selected services (rows) */}
          <div className="mt-2 space-y-2">
            {itemsArray.fields.map((field, idx) => (
              <div
                key={field.id}
                className="w-full p-3 mt-2 flex justify-between items-center gap-2"
              >
                <div className="w-[153.6px] text-[#979797] text-[14px]/[20px] tracking-normal font-hnd font-bold text-wrap">
                  {field.name}
                </div>

                {/* quantity: keep shadcn Select so we can coerce to number without changing schema */}
                <Select
                  value={String(watch(`items.${idx}.quantity`))}
                  onValueChange={(v) =>
                    setValue(`items.${idx}.quantity`, Number(v), {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="h-9 w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 21 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* bucket: custom SelectField (string enum) */}
                <SelectField
                  control={control}
                  name={`items.${idx}.bucket`}
                  options={BUCKET_OPTS}
                  triggerClassName="w-[142px]"
                  aria-label="Bucket"
                />

                <div className="pl-2 border-l border-[#E4E7EC]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => itemsArray.remove(idx)}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {itemsArray.fields.length === 0 && (
              <div className="rounded-md border border-dashed p-3 text-xs text-[#6B7280]">
                No services selected yet.
              </div>
            )}
          </div>

          {/* hidden submit */}
          <button type="submit" className="sr-only" aria-hidden="true" />
        </form>
      </Form>
    </CustomSheet>
  )
}

/* ───────────────────────  Services Picker  ─────────────────────── */
function ServicesPicker({ onPick }: { onPick: (svc: Service) => void }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<Service[]>([])
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // Debounced search
  React.useEffect(() => {
    let alive = true
    const t = setTimeout(async () => {
      setLoading(true)
      const data = await fetchServices(query)
      if (!alive) return
      setResults(data)
      setActiveIndex(0)
      setLoading(false)
    }, 180)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [query])

  function select(index: number) {
    const svc = results[index]
    if (!svc) return
    onPick(svc)
    setQuery("")
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] text-[#0F172A]">Services</Label>

      {/* Keep stable inside Sheet */}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div className="relative" data-service-search-trigger>
            <Input
              ref={inputRef}
              placeholder="Search services"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (!open) setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setActiveIndex((i) => Math.min(i + 1, results.length - 1))
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setActiveIndex((i) => Math.max(i - 1, 0))
                } else if (e.key === "Enter") {
                  e.preventDefault()
                  select(activeIndex)
                } else if (e.key === "Escape") {
                  setOpen(false)
                }
              }}
              className="pr-10"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#94A3B8]" />
              ) : (
                <Search className="h-4 w-4 text-[#94A3B8]" />
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="z-50 w-[420px] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement
            if (target.closest("[data-service-search-trigger]")) {
              e.preventDefault()
            }
          }}
        >
          <Command>
            <CommandList className="max-h-64">
              {results.length === 0 && !loading && (
                <CommandEmpty>No results.</CommandEmpty>
              )}
              {results.map((svc, i) => (
                <CommandItem
                  key={svc.id}
                  value={svc.name}
                  onSelect={() => select(i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={i === activeIndex ? "bg-accent" : ""}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate">{svc.name}</span>
                    <span className="shrink-0 pl-3 text-sm text-[#64748B]">
                      ₦{svc.price.toLocaleString()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-[13px] text-[#6B7280]">
        Add services you wish to request for patient
      </p>
    </div>
  )
}
