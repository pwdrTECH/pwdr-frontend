"use client";

import { SelectField, TextField } from "@/components/form";
import { AddButon, CancelButton, SubmitButton } from "@/components/form/button";
import { ConfirmPopover } from "@/components/overlays/ConfirmPopover";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { UploadFile } from "@/components/svgs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCreateEnrollee } from "@/lib/api/beneficiaries";
import { usePlansByScheme, useSchemes } from "@/lib/api/schemes";
import { getLgasByStateId, STATES } from "@/lib/nigeria-lga";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const enrolleeSchema = z.object({
  // Enrollee Details
  surname: z.string().min(2, "Surname is required"),
  firstName: z.string().min(2, "First name is required"),
  otherName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  passportImage: z.string().optional().nullable(), // Image stored as base64
  maritalStatus: z.string().optional(),
  employmentStatus: z.string().optional(),
  occupation: z.string().optional(),
  userRole: z.string().optional(),

  // Residential Address
  houseNumber: z.string().min(1, "House number is required"),
  street: z.string().min(3, "Street is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "Local government is required"),

  // Contact Details
  mobile: z.string().min(7, "Mobile number is required"),
  email: z.email("Valid email is required"),

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
      }),
    )
    .optional(),

  // Next of Kin
  nokFullName: z.string().optional(),
  nokStreet: z.string().optional(),
  nokMobile: z.string().optional(),
  nokEmail: z.string().optional(),
});

type EnrolleeFormValues = z.infer<typeof enrolleeSchema>;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
  });
};

export function AddEnrolleeForm() {
  const [open, setOpen] = useState(false);
  const [hasDependents, setHasDependents] = useState(false);
  const [enrolleeImage, setEnrolleeImage] = useState<string | null>(null);
  const [dependentImage, setDependentImage] = useState<string | null>(null);
  const { data: schemes } = useSchemes();
  const createEnrollee = useCreateEnrollee();

  const form = useForm<EnrolleeFormValues>({
    resolver: zodResolver(enrolleeSchema) as any,
    defaultValues: {
      // Enrollee Details
      surname: "",
      firstName: "",
      otherName: "",
      dateOfBirth: "",
      gender: "",
      passportImage: null,

      // Residential Address
      houseNumber: "",
      street: "",
      state: "",
      lga: "",

      // Contact Details
      mobile: "",
      email: "",

      // Enrollee Plan & Scheme
      scheme: "",
      plan: "",

      // Additional Info
      maritalStatus: "",
      employmentStatus: "",
      occupation: "",
      userRole: "principal",

      // Dependents - Initialize with empty values
      hasDependents: false,
      dependents: [
        {
          surname: "",
          firstName: "",
          otherName: "",
          passportImage: null,
        },
      ],

      // Next of Kin
      nokFullName: "",
      nokStreet: "",
      nokMobile: "",
      nokEmail: "",
    },
    mode: "onSubmit",
  });
  const selectedState = form.watch("state");
  const employmentStatus = form.watch("employmentStatus");
  const selectedScheme = form.watch("scheme");

  const selectedSchemeId = selectedScheme ? Number(selectedScheme) : undefined;

  const { data: plans } = usePlansByScheme(selectedSchemeId);
  React.useEffect(() => {
    if (selectedState) {
      form.setValue("lga", "", { shouldDirty: true, shouldValidate: false });
    }
  }, [selectedState, form]);

  const stateOptions = STATES.map((state) => ({
    value: state.id.toString(),
    label: state.name,
  }));

  const schemeOptions =
    schemes?.map((s) => ({ label: s.name, value: s.id })) || [];
  const planOptions = plans?.map((s) => ({ label: s.name, value: s.id })) || [];

  const lgaOptions = getLgasByStateId(Number(selectedState)).map((lga) => ({
    value: lga,
    label: lga,
  }));

  const handleEnrolleeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setEnrolleeImage(base64);
        form.setValue("passportImage", base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  const handleDependentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setDependentImage(base64);
        form.setValue("dependents.0.passportImage", base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  const removeEnrolleeImage = () => {
    setEnrolleeImage(null);
    form.setValue("passportImage", null);
  };

  const removeDependentImage = () => {
    setDependentImage(null);
    form.setValue("dependents.0.passportImage", null);
  };

  const onSubmit = async (values: EnrolleeFormValues) => {
    try {
      console.log("Submitting enrollee data:", values);

      const payload = {
        email: values.email,
        first_name: values.firstName,
        surname: values.surname,
        other_names: values.otherName || "",
        gender: values.gender,
        dob: values.dateOfBirth,
        address: `${values.houseNumber}, ${values.street}`,
        city: values.lga,
        state: values.state,
        phone: values.mobile,
        marital_status: values.maritalStatus || "Single",
        origin_state: values.state,
        origin_lga: values.lga,
        employment_status: values.employmentStatus || "Employed",
        occupation: values.occupation || "Not specified",
        user_role: values.userRole || "principal",
        principal_id: null,
        plan_id: Number(values.plan),
        next_of_kin: values.nokFullName || "Not specified",
        next_of_kin_relationship: "Other",
        next_of_kin_phone: values.nokMobile || "Not specified",
        next_of_kin_address: values.nokStreet || "Not specified",
        passport_image: values.passportImage || undefined,
      };

      console.log("API Payload:", payload);

      const result = await createEnrollee.mutateAsync(payload);

      console.log("Enrollee created successfully:", result);

      handleCancel();
      toast.success("Enrollee created successfully!");
    } catch (error: any) {
      console.error("Error creating enrollee:", error);

      // Handle server validation errors
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        let hasFieldErrors = false;

        // Set errors on specific form fields
        Object.keys(serverErrors).forEach((field) => {
          const formField = mapApiFieldToFormField(field);
          if (formField) {
            hasFieldErrors = true;
            form.setError(formField as any, {
              type: "server",
              message: serverErrors[field][0],
            });
          }
        });

        // Show general error for fields that couldn't be mapped
        if (hasFieldErrors) {
          form.setError("root", {
            type: "server",
            message: "Please fix the errors above",
          });
          toast.error("Validation Error", {
            description: "Please check the form for errors.",
          });
        } else {
          // Show all server errors in toast if no fields could be mapped
          const errorMessages = Object.values(serverErrors).flat();
          toast.error("Validation Error", {
            description: errorMessages.join(", "),
          });
        }
      } else if (error.response?.data?.message) {
        // General API error
        form.setError("root", {
          type: "server",
          message: error.response.data.message,
        });
        toast.error("Failed to create enrollee", {
          description: error.response.data.message,
        });
      } else {
        // Network or unknown error
        form.setError("root", {
          type: "server",
          message: error.message || "Failed to create enrollee",
        });
        toast.error("Failed to create enrollee", {
          description:
            error.message || "Please check your connection and try again.",
        });
      }
    }
  };
  // Helper function to map API field names to form field names
  const mapApiFieldToFormField = (apiField: string): string | null => {
    const fieldMap: Record<string, string> = {
      email: "email",
      first_name: "firstName",
      surname: "surname",
      other_names: "otherName",
      gender: "gender",
      dob: "dateOfBirth",
      phone: "mobile",
      state: "state",
      city: "lga",
      address: "street",
      plan_id: "plan",
      // Add more mappings as needed
    };

    return fieldMap[apiField] || null;
  };

  const handleCancel = () => {
    form.reset();
    setEnrolleeImage(null);
    setDependentImage(null);
    setHasDependents(false);
    setOpen(false);
  };

  const genderOptions = [
    { id: "male", name: "Male" },
    { id: "female", name: "Female" },
  ].map((g) => {
    return {
      value: g.id,
      label: g.name,
    };
  });
  const maritalStatusOptions = [
    { id: "single", name: "Single" },
    { id: "married", name: "Married" },
    { id: "divorced", name: "Divorced" },
    { id: "widowed", name: "Widowed" },
  ].map((status) => ({
    value: status.id,
    label: status.name,
  }));
  const employmentOptions = [
    { id: "employed", name: "Employed" },
    { id: "unemployed", name: "Unemployed" }, // Fixed spelling
    { id: "self-employed", name: "Self Employed" },
    { id: "student", name: "Student" },
  ].map((status) => ({
    value: status.id,
    label: status.name,
  }));

  const userRolesOptions = [
    { id: "principal", name: "Principal" },
    { id: "subordinate", name: "Subordinate" },
  ].map((role) => ({
    value: role.id,
    label: role.name,
  }));
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
            onConfirm={handleCancel}
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
            disabled={form.formState.isSubmitting || createEnrollee.isPending}
          >
            {form.formState.isSubmitting || createEnrollee.isPending
              ? "Adding..."
              : "Add Enrollee"}
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
          {/* Display root error at the top of the form */}
          {form.formState.errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}
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
            placeholder="John"
          />
          <TextField
            control={form.control}
            name="firstName"
            label="First Name"
            placeholder="Jane"
          />
          <TextField
            control={form.control}
            name="otherName"
            label="OtherName"
            placeholder="Doe"
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
          <SelectField
            control={form.control}
            name="maritalStatus"
            label="Marital Status"
            options={maritalStatusOptions}
            triggerClassName="justify-start"
            triggerAriaLabel="Marital Status"
          />
          <SelectField
            control={form.control}
            name="employmentStatus"
            label="Employment Status"
            options={employmentOptions}
            triggerClassName="justify-start"
            triggerAriaLabel="Employment Status"
          />
          {employmentStatus === "employed" && (
            <TextField
              control={form.control}
              name="occupation"
              label="Occupation"
              placeholder="Software Engineer"
            />
          )}
          <SelectField
            control={form.control}
            name="userRole"
            label="User Role"
            options={userRolesOptions}
            triggerClassName="justify-start"
            triggerAriaLabel="User Role"
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
  );
}
