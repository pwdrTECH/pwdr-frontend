"use client"

import { SelectField, TextField } from "@/components/form"
import { AddButon, CancelButton, SubmitButton } from "@/components/form/button"
import { ConfirmPopover } from "@/components/overlays/ConfirmPopover"
import { CustomSheet } from "@/components/overlays/SideDialog"
import { UploadFile } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { NIGERIA_STATES_AND_LGAS, STATES } from "@/lib/nigeria-lga"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import Image from "next/image"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const SCHEMES = [
  { id: "nhis", name: "NHIS" },
  { id: "phis", name: "PHIS" },
  { id: "tship", name: "TSHIP" },
] as const
const PLANS = [
  { id: "pearl", name: "Pearl" },
  { id: "family", name: "Family Plan" },
  { id: "gold", name: "Gold" },
] as const
const enrolleeSchema = z.object({
  // Enrollee Details
  surname: z.string().min(2, "Surname is required"),
  firstName: z.string().min(2, "First name is required"),
  otherName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  passportImage: z.string().optional().nullable(), // Image stored as base64

  // Residential Address
  houseNumber: z.string().min(1, "House number is required"),
  street: z.string().min(3, "Street is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "Local government is required"),

  // Contact Details
  mobile: z.string().min(7, "Mobile number is required"),
  email: z.string().email("Valid email is required"),

  // Enrollee Plan & Scheme
  scheme: z.string().min(1, "Scheme is required"),
  plan: z.string().min(1, "Plan is required"),

  // Dependents
  hasDependents: z.boolean().default(false),
  dependents: z
    .array(
      z.object({
        surname: z.string().optional(),
        firstName: z.string().optional(),
        otherName: z.string().optional(),
        passportImage: z.string().optional().nullable(), // Image stored as base64
      })
    )
    .optional(),

  // Next of Kin
  nokFullName: z.string().optional(),
  nokStreet: z.string().optional(),
  nokMobile: z.string().optional(),
  nokEmail: z.string().optional(),
})

type EnrolleeFormValues = z.infer<typeof enrolleeSchema>

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
  })
}

export function AddEnrolleeForm() {
  const [open, setOpen] = useState(false)
  const [hasDependents, setHasDependents] = useState(false)
  const [enrolleeImage, setEnrolleeImage] = useState<string | null>(null)
  const [dependentImage, setDependentImage] = useState<string | null>(null)

  const form = useForm<EnrolleeFormValues>({
    resolver: zodResolver(enrolleeSchema) as any,
    defaultValues: {
      surname: "",
      firstName: "",
      otherName: "",
      dateOfBirth: "",
      gender: "",
      passportImage: null,
      houseNumber: "",
      street: "",
      state: "",
      lga: "",
      mobile: "",
      email: "",
      scheme: "",
      plan: "",
      hasDependents: false,
      dependents: [],
      nokFullName: "",
      nokStreet: "",
      nokMobile: "",
      nokEmail: "",
    },
    mode: "onSubmit",
  })

  const selectedState = form.watch("state")

  // Reset LGA when state changes
  React.useEffect(() => {
    form.setValue("lga", "", { shouldDirty: true, shouldValidate: false })
  }, [selectedState, form])

  const stateOptions = STATES.map((s) => ({ value: s, label: s }))
  const schemeOptions = SCHEMES.map((s) => ({ label: s.name, value: s.id }))
  const planOptions = PLANS.map((s) => ({ label: s.name, value: s.id }))

  const lgaOptions = (
    NIGERIA_STATES_AND_LGAS[
      selectedState as keyof typeof NIGERIA_STATES_AND_LGAS
    ] ?? []
  ).map((l) => ({
    value: l,
    label: l,
  }))

  const handleEnrolleeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setEnrolleeImage(base64)
        form.setValue("passportImage", base64)
      } catch (error) {
        console.error("Error converting file to base64:", error)
      }
    }
  }

  const handleDependentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setDependentImage(base64)
        form.setValue("dependents.0.passportImage", base64)
      } catch (error) {
        console.error("Error converting file to base64:", error)
      }
    }
  }

  const removeEnrolleeImage = () => {
    setEnrolleeImage(null)
    form.setValue("passportImage", null)
  }

  const removeDependentImage = () => {
    setDependentImage(null)
    form.setValue("dependents.0.passportImage", null)
  }

  const onSubmit = (values: EnrolleeFormValues) => {
    console.log("Enrollee Created:", values)
    setOpen(false)
    setEnrolleeImage(null)
    setDependentImage(null)
    form.reset()
  }
  const genderOptions = [
    { id: "male", name: "Male" },
    { id: "female", name: "Female" },
  ].map((g) => {
    return {
      value: g.id,
      label: g.name,
    }
  })
  return (
    <CustomSheet
      title="Add Enrollee"
      subtitle="Create a profile for an enrollee"
      trigger={<AddButon text="Add Enrollee" />}
      open={open}
      onOpenChange={setOpen}
      contentClassName="px-6"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <ConfirmPopover
            variant="danger"
            title="Cancel Form?"
            confirmText="Yes, Cancel"
            trigger={<CancelButton text="Cancel" />}
            onConfirm={() => {
              form.reset()
              setEnrolleeImage(null)
              setDependentImage(null)
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
            formId="enrollee-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Adding..." : "Add Enrollee"}
          </SubmitButton>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="enrollee-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full sm:w-[427px] flex flex-col gap-8 pb-6"
        >
          {/* ============ Enrollee Details ============ */}
          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
              Enrollee Details
            </h2>
            <p className="text-[#475467] text-[16px]/[21.33px]">
              Enter enrollee personal information.
            </p>
          </div>

          <div className="flex items-center justify-between">
            {enrolleeImage ? (
              <div className="relative w-16 h-16">
                <Image
                  src={enrolleeImage || "/placeholder.svg"}
                  alt="Passport"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeEnrolleeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 bg-[#E9E9E9] rounded-lg" />
            )}
            <div>
              <input
                type="file"
                id="enrollee-upload"
                accept="image/*"
                onChange={handleEnrolleeImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("enrollee-upload")?.click()
                }
                className="h-9 flex items-center justify-center gap-1 text-[#1671D9] font-semibold text-[14px]/[20px] tracking-normal border-[#1671D91A] bg-[#1671D91A] hover:bg-[#1671D91A]/90 hover:text-[#1671D9] px-3 py-2 cursor-pointer"
              >
                <UploadFile />
                Upload Passport
              </Button>
            </div>
          </div>
          <TextField
            control={form.control}
            name="surname"
            label="Surname"
            placeholder="Ally Healthcare"
          />

          <TextField
            control={form.control}
            name="firstName"
            label="First Name"
            placeholder="admin@hmo.com"
          />

          <TextField
            control={form.control}
            name="otherName"
            label="OtherName"
            placeholder="+234..."
          />

          <TextField
            control={form.control}
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            placeholder="Select Date"
          />
          <SelectField
            control={form.control}
            name="gender"
            label="Gender"
            options={genderOptions}
            triggerClassName="justify-start"
            triggerAriaLabel="Gender"
          />

          {/* ============ Residential Address ============ */}

          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
              Residential Address
            </h2>
          </div>
          <TextField
            control={form.control}
            name="houseNumber"
            label="House Number"
            placeholder="Enter your house number"
          />
          <TextField
            control={form.control}
            name="street"
            label="Street"
            placeholder="Enter your house number"
          />

          <SelectField
            control={form.control}
            name="state"
            label="Select state"
            options={stateOptions}
            triggerClassName="justify-start"
            triggerAriaLabel="State"
          />

          <SelectField
            control={form.control}
            name="lga"
            label="Local Government"
            options={lgaOptions}
            triggerClassName="justify-start"
            placeholder={
              selectedState ? "Select local government" : "Select a state first"
            }
            triggerAriaLabel="Local Government"
            disabled={!selectedState}
          />

          {/* ============ Contact Details ============ */}
          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
              Contact Details
            </h2>
            <p className="text-[#475467] text-[16px]/[21.33px]">
              Enter enrollee contact information
            </p>
          </div>
          <TextField
            control={form.control}
            name="mobile"
            label="Mobile"
            placeholder="+234"
          />
          <TextField
            type="email"
            control={form.control}
            name="email"
            label="Email"
            placeholder="enrollee@gmail.com"
          />

          {/* ============ Enrollee Plan & Scheme ============ */}
          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
              Enrollee Plan & Scheme
            </h2>
          </div>
          <SelectField
            control={form.control}
            name="scheme"
            label="Select Scheme"
            options={schemeOptions}
            triggerClassName="justify-start"
            placeholder="Select a scheme"
            triggerAriaLabel="Select Scheme"
          />
          <SelectField
            control={form.control}
            name="plan"
            label="Select Plan"
            options={planOptions}
            triggerClassName="justify-start"
            placeholder="Select a plan"
            triggerAriaLabel="Select Plan"
          />

          {/* ============ Dependents ============ */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-hnd text-[18px] font-bold text-[#101828] tracking-normal">
                Dependents
              </h3>
              <p className="text-[#475467] text-[14px]/[20px]">
                Toggle on to add dependents to enrollee account
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasDependents(!hasDependents)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hasDependents ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasDependents ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {hasDependents && (
            <>
              <div className="flex items-center justify-between mb-4">
                {dependentImage ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={dependentImage || "/placeholder.svg"}
                      alt="Passport"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeDependentImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-[#E9E9E9] rounded-lg" />
                )}
                <div>
                  <input
                    type="file"
                    id="dependent-upload"
                    accept="image/*"
                    onChange={handleDependentImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("dependent-upload")?.click()
                    }
                    className="h-9 flex items-center justify-center gap-1 text-[#1671D9] font-semibold text-[14px]/[20px] tracking-normal border-[#1671D91A] bg-[#1671D91A] hover:bg-[#1671D91A]/90 hover:text-[#1671D9] px-3 py-2 cursor-pointer"
                  >
                    <UploadFile />
                    Upload Passport
                  </Button>
                </div>
              </div>
              <TextField
                control={form.control}
                name="dependents.0.surname"
                label="Surname"
                placeholder="Ally Healthcare"
              />
              <TextField
                control={form.control}
                name="dependents.0.firstName"
                label="First Name"
                placeholder="admin@hmo.com"
              />
              <TextField
                control={form.control}
                name="dependents.0.otherName"
                label="Other Name"
                placeholder="+234..."
              />

              <button
                type="button"
                className="h-10 w-full flex items-center justify-between cursor-pointer text-[#475467]"
                aria-label="Add dependent"
              >
                <span className="font-hnd text-[18px] font-bold tracking-normal">
                  Add New Dependent
                </span>
                <Plus size={30} />
              </button>

              {/* ============ Next of Kin Details ============ */}
              <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
                <h2 className="text-[#101828] font-bold text-[18px]/[28px]">
                  Next of Kin Details
                </h2>
              </div>
              <TextField
                control={form.control}
                name="nokFullName"
                label="Full Name"
                placeholder="Enter full name"
              />
              <TextField
                control={form.control}
                name="nokStreet"
                label="Street"
                placeholder="Enter street details"
              />
              <TextField
                control={form.control}
                name="nokMobile"
                label="Mobile"
                placeholder="+234..."
              />
              <TextField
                control={form.control}
                type="email"
                name="nokEmail"
                label="Email"
                placeholder="enrollee@gmail.com"
              />
            </>
          )}
        </form>
      </Form>
    </CustomSheet>
  )
}
