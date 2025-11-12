"use client"

import { TextField, TextareaField, type SelectOption } from "@/components/form"
import { AddButon, CancelButton, SubmitButton } from "@/components/form/button"
import { ConfirmPopover } from "@/components/overlays/ConfirmPopover"
import { CustomSheet } from "@/components/overlays/SideDialog"
import { NairaIcon } from "@/components/svgs"
import { Form } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Minus, Plus, X } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSchemes } from "@/lib/api/schemes"

const planFormSchema = z.object({
  planName: z
    .string()
    .min(1, "Plan name is required")
    .min(3, "Plan name must be at least 3 characters"),
  // we’ll store selected scheme IDs as strings
  schemes: z.array(z.string()).min(1, "At least one scheme must be selected"),
  premium: z
    .string()
    .min(1, "Premium is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Premium must be a positive number"
    ),
  threshold: z
    .string()
    .min(1, "Utilization threshold is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Threshold must be a positive number"
    ),
  daysToActivate: z
    .string()
    .min(1, "Days to activate is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Days must be a positive number"
    ),
  serviceItems: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Service name is required"),
        cost: z
          .string()
          .min(1, "Cost is required")
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) >= 0,
            "Cost must be a positive number"
          ),
        utilizationLimit: z
          .string()
          .min(1, "Utilization limit is required")
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            "Utilization limit must be a positive number"
          ),
        frequencyLimit: z
          .string()
          .min(1, "Frequency limit is required")
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            "Frequency limit must be a positive number"
          ),
      })
    )
    .min(1, "At least one service item is required"),
})

type PlanFormData = z.infer<typeof planFormSchema>

export default function AddPlanForm() {
  const [open, setOpen] = React.useState(false)
  const [schemeSelector, setSchemeSelector] = React.useState("")
  const [serviceItems, setServiceItems] = React.useState<
    Array<{
      id: string
      name: string
      cost: string
      utilizationLimit: string
      frequencyLimit: string
    }>
  >([{ id: "1", name: "", cost: "", utilizationLimit: "", frequencyLimit: "" }])

  const { data: schemes, isLoading: schemesLoading } = useSchemes()

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: "",
      schemes: [],
      premium: "",
      threshold: "",
      daysToActivate: "",
      serviceItems,
    },
  })

  // Build select options from API
  const schemeOptions: SelectOption[] = React.useMemo(
    () =>
      (schemes ?? []).map((s) => ({
        value: String(s.id), // store ID
        label: s.name,
      })),
    [schemes]
  )

  const selectedSchemeIds = form.watch("schemes") || []

  const handleSchemeSelect = (schemeId: string) => {
    if (!schemeId) return
    if (!selectedSchemeIds.includes(schemeId)) {
      const next = [...selectedSchemeIds, schemeId]
      form.setValue("schemes", next, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
    setSchemeSelector("")
  }

  const removeScheme = (schemeId: string) => {
    const next = selectedSchemeIds.filter((id) => id !== schemeId)
    form.setValue("schemes", next, { shouldDirty: true, shouldValidate: true })
  }

  const getSchemeLabel = (schemeId: string) =>
    schemeOptions.find((o) => o.value === schemeId)?.label ?? schemeId

  const removeServiceItem = (id: string) => {
    const newItems = serviceItems.filter((item) => item.id !== id)
    setServiceItems(newItems)
    form.setValue("serviceItems", newItems, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const addServiceItem = () => {
    const maxId = serviceItems.reduce(
      (max, item) => Math.max(max, Number.parseInt(item.id) || 0),
      0
    )
    const newId = String(maxId + 1)

    const newItems = [
      ...serviceItems,
      {
        id: newId,
        name: "",
        cost: "",
        utilizationLimit: "",
        frequencyLimit: "",
      },
    ]
    setServiceItems(newItems)
    form.setValue("serviceItems", newItems, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onSubmit = (data: PlanFormData) => {
    // Here you can call your create-plan mutation:
    // - data.schemes is an array of scheme IDs (string[]
    // - map to payload your backend expects
    console.log("[plan] submit payload:", data)
    alert("Plan added successfully! Check console for data.")
    // Optionally close + reset
    // setOpen(false)
    // form.reset()
    // setServiceItems([{ id: "1", name: "", cost: "", utilizationLimit: "", frequencyLimit: "" }])
  }

  return (
    <CustomSheet
      title="Add Plan"
      subtitle="Create a profile for an enrollee"
      trigger={<AddButon text="Add Plan" />}
      open={open}
      onOpenChange={setOpen}
      footer={
        <div className="flex w-full items-center justify-between">
          <ConfirmPopover
            variant="danger"
            title="Cancel Form?"
            confirmText="Yes, Cancel"
            trigger={<CancelButton text="Cancel" />}
            onConfirm={() => {
              form.reset()
              setServiceItems([
                {
                  id: "1",
                  name: "",
                  cost: "",
                  utilizationLimit: "",
                  frequencyLimit: "",
                },
              ])
              setOpen(false)
            }}
            description={
              <p className="font-hnd font-normal text-[#667085] text-[16px]/[24px] tracking-normal space-y-2">
                You&apos;re attempting to cancel this form. Doing so will
                discard the progress you&apos;ve made.
                <span className="block mt-2">
                  Do you want to proceed with this action?
                </span>
              </p>
            }
          />
          <SubmitButton
            formId="provider-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Add Plan"}
          </SubmitButton>
        </div>
      }
      contentClassName="px-6"
    >
      <Form {...form}>
        <form
          id="provider-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full sm:w-[427px] flex flex-col gap-8"
        >
          {/* Plan Details */}
          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
              Plan Details
            </h2>
            <p className="text-[#475467] text-[16px]/[21.33px]">
              Enter plan basic details
            </p>
          </div>

          <TextField
            control={form.control}
            name="planName"
            label="Plan Name"
            placeholder="Enter plan name"
          />

          {/* Schemes selector (from API) */}
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900">
                Scheme
              </label>
              <Select
                value={schemeSelector}
                onValueChange={handleSchemeSelect}
                disabled={schemesLoading || !schemeOptions.length}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      schemesLoading
                        ? "Loading schemes..."
                        : schemeOptions.length
                        ? "Select schemes this plan applies to"
                        : "No schemes available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {schemeOptions.map((opt) => (
                      <SelectItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Scheme Tags (IDs -> labels) */}
            {selectedSchemeIds.length > 0 && (
              <div className="w-full flex flex-wrap gap-4">
                {selectedSchemeIds.map((id) => (
                  <div
                    key={id}
                    className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md"
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {getSchemeLabel(id)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeScheme(id)}
                      className="text-[#98A2B3] hover:text-[#98A2B3]/90 transition-colors cursor-pointer"
                      aria-label={`Remove scheme ${getSchemeLabel(id)}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Premium / Threshold / Days */}
          <TextField
            control={form.control}
            name="premium"
            label="Premium"
            placeholder="Enter premium amount"
            type="number"
            step="0.01"
            rightAdornment={<NairaIcon />}
          />
          <TextField
            control={form.control}
            name="threshold"
            label="Utilization Threshold"
            placeholder="Enter amount"
            type="number"
            step="0.01"
            rightAdornment={<NairaIcon />}
          />
          <TextField
            control={form.control}
            name="daysToActivate"
            label="Days to Activate"
            placeholder="e.g. 7"
            type="number"
          />

          {/* Service Items */}
          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
              Service Items
            </h2>
            <p className="text-[#475467] text-[16px]/[21.33px]">
              Enter plan basic details
            </p>
          </div>

          <div className="space-y-6">
            {serviceItems.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between w-full">
                  <label className="font-hnd text-[18px]/[28px] font-bold text-[#101828]">
                    Service {index + 1}
                  </label>
                  {serviceItems.length > 1 && (
                    <div className="w-11 h-11 bg-white py-2.5 px-[18px] flex gap-2 justify-center items-center">
                      <button
                        type="button"
                        onClick={() => removeServiceItem(item.id)}
                        className="w-6 h-6 border-[1.5px] border-[#98A2B3] rounded-xl text-[#98A2B3] hover:text-gray-600 transition-colors flex items-center justify-center cursor-pointer"
                        aria-label={`Remove service ${index + 1}`}
                      >
                        <Minus size={20} />
                      </button>
                    </div>
                  )}
                </div>

                <TextareaField
                  control={form.control}
                  name={`serviceItems.${index}.name`}
                  label="Service name/Description"
                  placeholder="Service name...."
                  rows={3}
                />

                <TextField
                  control={form.control}
                  name={`serviceItems.${index}.cost`}
                  label="Cost"
                  placeholder="Enter amount"
                  type="number"
                  step="0.01"
                  rightAdornment={<NairaIcon />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    control={form.control}
                    name={`serviceItems.${index}.utilizationLimit`}
                    label="Utilization Limit"
                    placeholder="Enter amount"
                    type="number"
                    rightAdornment={<NairaIcon />}
                  />
                  <TextField
                    control={form.control}
                    name={`serviceItems.${index}.frequencyLimit`}
                    label="Frequency Limit"
                    placeholder="1, 2, ...."
                    type="number"
                    rightAdornment={
                      <span className="italic text-[16px]/[24px] text-[#667085]">
                        per Year
                      </span>
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="h-10 w-full flex items-center justify-between mt-6 cursor-pointer text-[#475467]"
            onClick={addServiceItem}
            aria-label="Add service"
          >
            <span className="font-hnd text-[18px] font-bold tracking-normal">
              Add New Service
            </span>
            <Plus size={30} />
          </button>
        </form>
      </Form>
    </CustomSheet>
  )
}
