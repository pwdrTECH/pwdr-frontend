"use client";

import { SelectField } from "@/components/form";
import { CancelButton, SubmitButton } from "@/components/form/button";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { CircledUpArrow } from "@/components/svgs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { EnrolleeDetail } from "@/lib/api/beneficiaries";
import { useChangeEnrolleePlan } from "@/lib/api/beneficiaries";
import { usePlansByScheme } from "@/lib/api/schemes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const enrolleeSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
});

type EnrolleeFormValues = z.infer<typeof enrolleeSchema>;

interface EditEnrolleeFormProps {
  enrollee: EnrolleeDetail | null | undefined;
}

export function UpgradePlan({ enrollee }: EditEnrolleeFormProps) {
  const [open, setOpen] = useState(false);
  const changePlan = useChangeEnrolleePlan();
  // Fetch plans for selected scheme
  const { data: plans } = usePlansByScheme(enrollee?.hmo_id);
  const form = useForm<EnrolleeFormValues>({
    resolver: zodResolver(enrolleeSchema) as any,
    mode: "onSubmit",
    defaultValues: {
      plan: "",
    },
  });

  const planOptions =
    plans?.map((p) => ({ label: p.name, value: String(p.id) })) || [];

  const onSubmit = async (values: EnrolleeFormValues) => {
    if (!enrollee?.enrolee_id) {
      toast.error("Missing enrollee ID");
      return;
    }

    try {
      const payload = {
        enrolee_id: enrollee.enrolee_id,
        plan_id: Number(values.plan),
      };

      const result = await changePlan.mutateAsync(payload);
      console.log("Plan changed successfully:", result);

      handleCancel();
      toast.success("Enrollee plan updated successfully!");
    } catch (error: any) {
      console.error("Error changing enrollee plan:", error);

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        let hasFieldErrors = false;

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

        if (hasFieldErrors) {
          form.setError("root", {
            type: "server",
            message: "Please fix the errors above",
          });
          toast.error("Validation Error", {
            description: "Please check the form for errors.",
          });
        } else {
          const errorMessages = Object.values(serverErrors).flat();
          toast.error("Validation Error", {
            description: (errorMessages as string[]).join(", "),
          });
        }
      } else if (error.response?.data?.message) {
        form.setError("root", {
          type: "server",
          message: error.response.data.message,
        });
        toast.error("Failed to update plan", {
          description: error.response.data.message,
        });
      } else {
        form.setError("root", {
          type: "server",
          message: error.message || "Failed to update plan",
        });
        toast.error("Failed to update plan", {
          description:
            error.message || "Please check your connection and try again.",
        });
      }
    }
  };

  // Map backend field names → form field names
  const mapApiFieldToFormField = (apiField: string): string | null => {
    const fieldMap: Record<string, string> = {
      plan_id: "plan",
      scheme_id: "scheme",
    };

    return fieldMap[apiField] || null;
  };

  const handleCancel = () => {
    form.reset({
      plan: "",
    });
    setOpen(false);
  };

  return (
    <CustomSheet
      title="Upgrade Enrollee's Plan"
      subtitle="Update the plan details for this enrollee."
      trigger={
        <Button
          variant="outline"
          className="w-fit h-10 rounded-xl border border-[#D0D5DD] py-2.5 px-3.5 flex items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]"
        >
          <CircledUpArrow /> Upgrade Plan
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      contentClassName="px-6"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <CancelButton text="Cancel" onClick={() => setOpen(false)} />
          <SubmitButton
            formId="enrollee-form"
            disabled={form.formState.isSubmitting || changePlan.isPending}
          >
            {form.formState.isSubmitting || changePlan.isPending
              ? "Saving..."
              : "Save Changes"}
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
          {form.formState.errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}

          <SelectField
            control={form.control}
            name="plan"
            label="Select Plan"
            options={planOptions}
            triggerClassName="justify-start"
            placeholder="Select plan"
            triggerAriaLabel="Select Plan"
          />
        </form>
      </Form>
    </CustomSheet>
  );
}
