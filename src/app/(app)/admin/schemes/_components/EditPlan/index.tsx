"use client";

import type { SelectOption } from "@/components/form";
import { CancelButton, SubmitButton } from "@/components/form/button";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { EditIcon } from "@/components/svgs";
import { Button } from "@/components/ui/button";
import { useSchemes, useUpdatePlan } from "@/lib/api/schemes";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import EditPlanForm from "./form";

const planFormSchema = z.object({
  planName: z
    .string()
    .min(1, "Plan name is required")
    .min(3, "Plan name must be at least 3 characters"),
  schemes: z.array(z.string()).min(1, "At least one scheme must be selected"),
  premium: z
    .string()
    .min(1, "Premium is required")
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
      "Premium must be a positive number",
    ),
  threshold: z
    .string()
    .min(1, "Utilization threshold is required")
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
      "Threshold must be a positive number",
    ),
  daysToActivate: z
    .string()
    .min(1, "Days to activate is required")
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
      "Days must be a positive number",
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
            (val) => !Number.isNaN(Number(val)) && Number(val) >= 0,
            "Cost must be a positive number",
          ),
        utilizationLimit: z
          .string()
          .min(1, "Utilization limit is required")
          .refine(
            (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
            "Utilization limit must be a positive number",
          ),
        frequencyLimit: z
          .string()
          .min(1, "Frequency limit is required")
          .refine(
            (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
            "Frequency limit must be a positive number",
          ),
      }),
    )
    .min(1, "At least one service item is required"),
});

type PlanFormData = z.infer<typeof planFormSchema>;

type EditPlanFormProps = {
  plan: {
    id: number | string;
    name: string;
    premium: number | string;
    utilization: number | string;
    waitDays: number | string;
    schemes?: string[];
    serviceItems?: Array<{
      id?: string | number;
      name?: string;
      service_name?: string;
      cost?: string | number;
      utilizationLimit?: string | number;
      utilization_limit?: string | number;
      limit?: string | number;
      frequencyLimit?: string | number;
      frequency_limit?: string | number;
      freq?: string | number;
    }>;
  };
};

export default function EditPlan({ plan }: EditPlanFormProps) {
  const [open, setOpen] = React.useState(false);
  const { data: schemes } = useSchemes();

  //  Build scheme options defensively from whatever your backend sends
  const schemeOptions: SelectOption[] =
    schemes?.map((s: any) => ({
      value: String(s.id),
      label: String(s.name),
    })) ?? [];

  // Normalise service items for form (ensure ALL strings)
  const normalizedServiceItems: {
    id: string;
    name: string;
    cost: string;
    utilizationLimit: string;
    frequencyLimit: string;
  }[] =
    Array.isArray(plan?.serviceItems) && plan.serviceItems.length > 0
      ? plan.serviceItems.map((svc, idx) => {
          const utilRaw =
            svc.utilizationLimit ?? svc.utilization_limit ?? svc.limit ?? "";
          const freqRaw =
            svc.frequencyLimit ?? svc.frequency_limit ?? svc.freq ?? "";

          return {
            id: String(svc.id ?? idx + 1),
            name: svc.name ?? svc.service_name ?? "",
            cost: svc.cost != null ? String(svc.cost) : "",
            utilizationLimit:
              utilRaw !== undefined && utilRaw !== null ? String(utilRaw) : "",
            frequencyLimit:
              freqRaw !== undefined && freqRaw !== null ? String(freqRaw) : "",
          };
        })
      : [
          {
            id: "1",
            name: "",
            cost: "",
            utilizationLimit: "",
            frequencyLimit: "",
          },
        ];

  // Initial schemes for the plan → prefer plan.schemes; otherwise first option
  const initialSchemesRaw =
    plan?.schemes && plan.schemes.length > 0
      ? plan.schemes
      : schemeOptions[0]?.value
        ? [schemeOptions[0].value]
        : [];

  const initialSchemes: string[] = initialSchemesRaw.map((s) => String(s));
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: plan?.name || "",
      schemes: initialSchemes,
      premium: plan?.premium ? String(plan.premium) : "",
      threshold: plan?.utilization ? String(plan.utilization) : "",
      daysToActivate: plan?.waitDays ? String(plan.waitDays) : "",
      serviceItems: normalizedServiceItems,
    },
    mode: "onChange",
  });

  const updatePlan = useUpdatePlan();
  const isSubmitting = form.formState.isSubmitting || updatePlan.isPending;

  return (
    <CustomSheet
      title="Edit Plan"
      subtitle="Edit this plan"
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-[36px] w-fit hover:bg-primary/90 hover:text-white text-[14px]/[20px] text-[#344054] bg-transparent"
        >
          <EditIcon />
          Edit Plan
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      footer={
        <div className="flex w-full items-center justify-between">
          <CancelButton
            onClick={() => {
              form.reset();
              setOpen(false);
            }}
            text="Cancel"
          />
          <SubmitButton
            formId="edit-plan-form"
            disabled={!form.formState.isValid || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Update Plan"}
          </SubmitButton>
        </div>
      }
      contentClassName="px-6"
    >
      <EditPlanForm plan={plan} onSuccess={() => setOpen(false)} />
    </CustomSheet>
  );
}
