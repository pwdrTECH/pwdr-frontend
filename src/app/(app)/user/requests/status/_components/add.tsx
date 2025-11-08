"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
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
  CommandInput,
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

/* ---------------------------------------------
   Enums (single source of truth)
---------------------------------------------- */
const BUCKETS = ["Drugs", "Labs", "Consultation", "Other"] as const
const BucketEnum = z.enum(BUCKETS)
type Bucket = (typeof BUCKETS)[number]

const CHANNELS = ["WhatsApp", "Email", "SMS", "Web Portal"] as const
const ChannelEnum = z.enum(CHANNELS)
type Channel = (typeof CHANNELS)[number]

/* ---------------------------------------------
   Types & Zod schema
---------------------------------------------- */
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

/** IMPORTANT: no .default() here — keep fields required to match RHF generics */
const schema = z.object({
  patientId: z.string().min(1, "Enter patient ID"),
  channel: ChannelEnum,
  items: z.array(itemSchema),
})

type FormValues = z.infer<typeof schema>

/* ---------------------------------------------
   Mock data / fake APIs (swap with real ones)
---------------------------------------------- */
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
    name: "Drug3361 - TETANUS TOXOID INJ",
    price: 700,
    category: "Drugs",
  },
  { id: "svc2", name: "CBC - Full Blood Count", price: 3500, category: "Labs" },
  {
    id: "svc3",
    name: "Consultation - General",
    price: 2500,
    category: "Consultation",
  },
]
async function fakeLookupPatient(id: string): Promise<Patient | null> {
  await new Promise((r) => setTimeout(r, 450))
  return (
    MOCK_PATIENTS.find((p) => p.id.toLowerCase() === id.toLowerCase()) ?? null
  )
}
async function fakeCheckEligibility(_: Patient): Promise<Eligibility> {
  await new Promise((r) => setTimeout(r, 700))
  return Math.random() > 0.35 ? "eligible" : "inactive"
}
async function searchServices(q: string): Promise<Service[]> {
  const query = q.trim().toLowerCase()
  return !query
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter((s) => s.name.toLowerCase().includes(query))
}

/* ---------------------------------------------
   Component
---------------------------------------------- */
export default function ProcessRequest() {
  const [open, setOpen] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    /** Put defaults here (not in the schema) */
    defaultValues: { patientId: "", channel: "WhatsApp", items: [] },
    mode: "onChange",
  })
  const { control, watch, setValue, handleSubmit, formState, reset } = form
  const itemsArray = useFieldArray({ control, name: "items" })

  // Patient + eligibility
  const [typing, setTyping] = React.useState(false)
  const [patient, setPatient] = React.useState<Patient | null>(null)
  const [patientFound, setPatientFound] = React.useState(false)
  const [eligibility, setEligibility] = React.useState<Eligibility>("idle")

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
    }, 350)
    return () => clearTimeout(t)
  }, [patientId])

  // Services combobox
  const [svcOpen, setSvcOpen] = React.useState(false)
  const [svcQuery, setSvcQuery] = React.useState("")
  const [svcResults, setSvcResults] = React.useState<Service[]>(MOCK_SERVICES)
  React.useEffect(() => {
    let active = true
    searchServices(svcQuery).then((res) => active && setSvcResults(res))
    return () => {
      active = false
    }
  }, [svcQuery])

  function addServiceRow(svc: Service) {
    const exists = itemsArray.fields.some((f) => f.serviceId === svc.id)
    if (exists) return
    itemsArray.append({
      serviceId: svc.id,
      name: svc.name,
      price: svc.price,
      quantity: 0,
      bucket: svc.category,
    })
  }

  function duplicateRow(idx: number) {
    const row = itemsArray.fields[idx]
    itemsArray.append({ ...row, serviceId: row.serviceId + "_copy" })
  }

  const canCreate =
    patientFound &&
    eligibility === "eligible" &&
    watch("items").some((it) => it.quantity > 0)

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (!canCreate) return
    console.log("Create request:", values)
    // TODO: call your API here
    setOpen(false)
    reset({ patientId: "", channel: "WhatsApp", items: [] })
    setPatient(null)
    setPatientFound(false)
    setEligibility("idle")
    setSvcQuery("")
  }

  return (
    <CustomSheet
      title="New request"
      subtitle="Send out authorization request to a patient's HMO"
      trigger={
        <Button
          variant="ghost"
          className="text-[14px]/[20px] text-primary tracking-normal font-bold hover:underline p-0 justify-start"
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
          setSvcQuery("")
        }
      }}
      footer={
        <div className="flex w-full items-center justify-between px-[25.6px]">
          <Button
            type="button"
            variant="outline"
            className="h-[43.33px] rounded-[8.53px] border-[#E8ECF3] text-[14px] text-[#3D4551] hover:bg-[#F6FAFB]"
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
            className="h-[43.33px] rounded-[8.53px]"
            disabled={!canCreate || formState.isSubmitting}
          >
            {formState.isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      }
      contentClassName="px-6"
    >
      <Form<FormValues> {...form}>
        <form
          id="new-request-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full sm:w-[512px] space-y-6 pt-6 pb-8"
        >
          {/* Patient ID */}
          <div className="space-y-1">
            <Label className="text-[13px] text-[#0F172A]">Patient ID</Label>
            <div className="relative">
              <Input
                placeholder="Search patient"
                value={patientId}
                onChange={(e) =>
                  setValue("patientId", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="pr-10"
                autoFocus
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {typing || eligibility === "checking" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
                ) : patientFound ? (
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                ) : null}
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">
              Which patient would you like to create a request for?
            </p>
          </div>

          {/* Patient card & eligibility */}
          {patient && (
            <div className="mt-2 space-y-1 rounded-lg border bg-white p-3">
              <div className="font-medium text-[#0F172A]">{patient.name}</div>
              <div className="text-[13px] text-[#334155]">{patient.id}</div>
              <div className="text-[13px] text-[#334155]">{patient.plan}</div>
              <div className="mt-2 flex items-center gap-2 text-[13px]">
                {eligibility === "checking" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                    <span className="text-[#0284C7]">
                      Checking eligibility…
                    </span>
                  </>
                )}
                {eligibility === "inactive" && (
                  <>
                    <AlertCircle className="h-4 w-4 text-[#EF4444]" />
                    <span className="text-[#EF4444]">No active records</span>
                  </>
                )}
                {eligibility === "eligible" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                    <span className="text-[#16A34A]">Patient eligible</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Channel */}
          <div className="space-y-1">
            <Label className="text-[13px] text-[#0F172A]">Channel</Label>
            <Select
              value={watch("channel")}
              onValueChange={(v) =>
                setValue("channel", v as Channel, { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-10 justify-start">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366]">
                    <MessageCircle className="h-3.5 w-3.5 text-white" />
                  </span>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#6B7280]">
              The channel you want to communicate with the HMO
            </p>
          </div>

          {/* Services */}
          <div className="space-y-1">
            <Label className="text-[13px] text-[#0F172A]">Services</Label>

            {/* Combobox */}
            <Popover open={svcOpen} onOpenChange={setSvcOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder="Search services"
                    onFocus={() => setSvcOpen(true)}
                    value={svcQuery}
                    onChange={(e) => setSvcQuery(e.target.value)}
                    className="pr-8"
                  />
                  <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0">
                <Command>
                  <div className="px-2 py-2">
                    <CommandInput
                      placeholder="Type to filter services"
                      value={svcQuery}
                      onValueChange={setSvcQuery}
                    />
                  </div>
                  <CommandList className="max-h-64">
                    <CommandEmpty>No results.</CommandEmpty>
                    {svcResults.map((svc) => (
                      <CommandItem
                        key={svc.id}
                        value={svc.name}
                        onSelect={() => {
                          addServiceRow(svc)
                          setSvcOpen(false)
                          setSvcQuery("")
                        }}
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

            <p className="text-xs text-[#6B7280]">
              Add services you wish to request for patient
            </p>

            {/* Selected items */}
            <div className="mt-3 space-y-2">
              {itemsArray.fields.map((field, idx) => (
                <div key={field.id} className="rounded-lg border p-3">
                  <div className="text-[13px] font-medium text-[#0F172A]">
                    {field.name}{" "}
                    <span className="font-normal text-[#64748B]">
                      (₦{field.price.toLocaleString()})
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {/* Quantity */}
                    <Select
                      value={String(watch(`items.${idx}.quantity`))}
                      onValueChange={(v) =>
                        setValue(`items.${idx}.quantity`, Number(v), {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger className="h-9 w-[72px]">
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

                    {/* Bucket */}
                    <Select
                      value={watch(`items.${idx}.bucket`)}
                      onValueChange={(v) =>
                        setValue(`items.${idx}.bucket`, v as Bucket, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUCKETS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => duplicateRow(idx)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
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
                </div>
              ))}

              {itemsArray.fields.length === 0 && (
                <div className="rounded-md border border-dashed p-3 text-xs text-[#6B7280]">
                  No services selected yet.
                </div>
              )}
            </div>
          </div>

          {/* Hidden submit so Enter can submit from fields */}
          <button type="submit" className="sr-only" aria-hidden="true" />
        </form>
      </Form>
    </CustomSheet>
  )
}
