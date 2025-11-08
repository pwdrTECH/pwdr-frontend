"use client"

import { TextField } from "@/components/form"
import { AddButon, CancelButton, SubmitButton } from "@/components/form/button"
import { ConfirmPopover } from "@/components/overlays/ConfirmPopover"
import { CustomSheet } from "@/components/overlays/SideDialog"
import { UploadFile } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, PlusIcon, X } from "lucide-react"
import Image from "next/image"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const enrolleeSchema = z.object({
  dependents: z
    .array(
      z.object({
        surname: z.string().optional(),
        firstName: z.string().optional(),
        otherName: z.string().optional(),
        passportImage: z.string().optional().nullable(),
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

export function AddDependence() {
  const [open, setOpen] = useState(false)
  const [dependentImage, setDependentImage] = useState<string | null>(null)

  const form = useForm<EnrolleeFormValues>({
    resolver: zodResolver(enrolleeSchema) as any,
    defaultValues: {
      dependents: [],
    },
    mode: "onSubmit",
  })

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

  const removeDependentImage = () => {
    setDependentImage(null)
    form.setValue("dependents.0.passportImage", null)
  }

  const onSubmit = (values: EnrolleeFormValues) => {
    console.log("Enrollee Created:", values)
    setOpen(false)
    setDependentImage(null)
    form.reset()
  }

  return (
    <CustomSheet
      title="Add Dependent"
      subtitle=""
      trigger={
        <Button className="w-fit h-10 flex items-center justify-center gap-1 text-[#1671D9] font-semibold text-[14px]/[20px] tracking-normal border-[#1671D91A] bg-[#1671D91A] hover:bg-[#1671D91A]/90 hover:text-[#1671D9] px-3 py-2 cursor-pointer">
          <PlusIcon className="w-6 h-6" /> Add Dependent
        </Button>
      }
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
        </form>
      </Form>
    </CustomSheet>
  )
}
