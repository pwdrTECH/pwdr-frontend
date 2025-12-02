"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, X } from "lucide-react";
import { TextField, TextareaField, type SelectOption } from "@/components/form";
import { NairaIcon } from "@/components/svgs";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSchemes, useUpdatePlan } from "@/lib/api/schemes";

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

type PlanViewModel = {
  id: number | string;
  name: string;
  premium: number | string;
  utilization: number | string;
  waitDays: number | string;
  schemes?: (string | number)[];
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

export type EditPlanFormBodyProps = {
  plan: PlanViewModel;
  onSuccess?: () => void;
};

export default function EditPlanForm({
  plan,
  onSuccess,
}: EditPlanFormBodyProps) {
  const {
    data: schemes,
    isLoading: schemesLoading,
    isError: schemesError,
  } = useSchemes();

  // Build scheme options from API
  const schemeOptions: SelectOption[] =
    schemes?.map((s: any) => ({
      value: String(s.id),
      label: String(s.name),
    })) ?? [];
  console.log("schemeOptions", schemeOptions);
  // Normalise service items for form (all strings)
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

  // Initial schemes for the plan
  const initialSchemesRaw =
    plan?.schemes && plan.schemes.length > 0
      ? plan.schemes
      : schemeOptions[0]?.value
        ? [schemeOptions[0].value]
        : [];

  const initialSchemes: string[] = initialSchemesRaw.map((s) => String(s));

  const [selectedSchemes, setSelectedSchemes] =
    React.useState<string[]>(initialSchemes);
  const [schemeSelector, setSchemeSelector] = React.useState("");

  const [serviceItems, setServiceItems] = React.useState<
    {
      id: string;
      name: string;
      cost: string;
      utilizationLimit: string;
      frequencyLimit: string;
    }[]
  >(normalizedServiceItems);

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

  const handleSchemeSelect = (scheme: string) => {
    if (!selectedSchemes.includes(scheme)) {
      const newSchemes = [...selectedSchemes, scheme];
      setSelectedSchemes(newSchemes);
      form.setValue("schemes", newSchemes);
    }
    setSchemeSelector("");
  };

  const removeScheme = (scheme: string) => {
    const newSchemes = selectedSchemes.filter((s) => s !== scheme);
    setSelectedSchemes(newSchemes);
    form.setValue("schemes", newSchemes);
  };

  const removeServiceItem = (id: string) => {
    const newItems = serviceItems.filter((item) => item.id !== id);
    setServiceItems(newItems);
    form.setValue("serviceItems", newItems);
  };

  const addServiceItem = () => {
    const newId = String(
      Math.max(...serviceItems.map((item) => Number(item.id)), 0) + 1,
    );
    const newItems = [
      ...serviceItems,
      {
        id: newId,
        name: "",
        cost: "",
        utilizationLimit: "",
        frequencyLimit: "",
      },
    ];
    setServiceItems(newItems);
    form.setValue("serviceItems", newItems);
  };

  const onSubmit = async (data: PlanFormData) => {
    if (!plan?.id) {
      toast.error("Missing plan id for update");
      return;
    }

    try {
      const payload = {
        plan_id: Number(plan.id),
        name: data.planName.trim(),
        premium: data.premium.trim(),
        utilization_threshold: data.threshold.trim(),
        days_to_activate: Number(data.daysToActivate),
        active: 1,
      };

      await updatePlan.mutateAsync(payload);
      onSuccess?.();
      toast.success("Plan updated successfully");
    } catch (err: any) {
      toast.error("Failed to update plan", {
        description: err?.message ?? "Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        id="edit-plan-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:w-[427px] flex flex-col gap-8"
      >
        <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
          <h2 className="text-[#101828] font-bold text-[18px]/[28px] mb-1">
            Plan Details
          </h2>
          <p className="text-[#475467] text-[16px]/[21.33px] mb-6">
            Edit plan basic details
          </p>
        </div>

        {schemesError && (
          <p className="text-xs text-red-500">
            Failed to load schemes. Check /fetch-scheme.php response.
          </p>
        )}

        <TextField
          control={form.control as any}
          name="planName"
          label="Plan Name"
          placeholder="Enter plan name"
        />

        {/* Schemes */}
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="scheme"
              className="text-sm font-medium text-gray-900"
            >
              Scheme
            </label>
            <Select
              value={schemeSelector}
              onValueChange={handleSchemeSelect}
              // disabled={schemesLoading || schemeOptions.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    schemesLoading
                      ? "Loading schemes..."
                      : schemeOptions.length === 0
                        ? "No schemes available"
                        : "Select Schemes this plan applies to"
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

          {selectedSchemes.length > 0 && (
            <div className="w-full flex flex-wrap gap-4">
              {selectedSchemes.map((scheme) => (
                <div
                  key={scheme}
                  className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md"
                >
                  <span className="text-xs font-medium text-gray-700">
                    {scheme}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeScheme(scheme)}
                    className="text-[#98A2B3] hover:text-[#98A2B3]/90 transition-colors cursor-pointer"
                    aria-label={`Remove ${scheme}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <TextField
          control={form.control as any}
          name="premium"
          label="Premium"
          placeholder="Enter premium amount"
          type="number"
          step="0.01"
          min={0}
          rightAdornment={<NairaIcon />}
        />

        <TextField
          control={form.control as any}
          name="threshold"
          label="Utilization Threshold"
          placeholder="Enter amount"
          type="number"
          step="0.01"
          min={0}
          rightAdornment={<NairaIcon />}
        />

        <TextField
          control={form.control as any}
          name="daysToActivate"
          label="Days to Activate"
          placeholder="eg. 7 Days"
          min={0}
          type="number"
        />

        {/* Service Items */}
        <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
          <h2 className="text-[#101828] font-bold text-[18px]/[28px] mb-1">
            Service Items
          </h2>
          <p className="text-[#475467] text-[16px]/[21.33px] mb-6">
            Edit the services covered by this plan
          </p>
        </div>

        <div className="space-y-6">
          {serviceItems.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <label
                  htmlFor="service"
                  className="font-hnd text-[18px]/[28px] font-bold text-[#101828] tracking-normal"
                >
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
                control={form.control as any}
                name={`serviceItems.${index}.name`}
                label="Service name/Description"
                placeholder="Enter service description"
                rows={3}
              />

              <TextField
                control={form.control as any}
                name={`serviceItems.${index}.cost`}
                label="Cost"
                placeholder="Enter amount"
                type="number"
                min={0}
                step="0.01"
                rightAdornment={<NairaIcon />}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={form.control as any}
                  name={`serviceItems.${index}.utilizationLimit`}
                  label="Utilization Limit"
                  placeholder="Enter amount"
                  type="number"
                  min={0}
                  rightAdornment={<NairaIcon />}
                />
                <TextField
                  control={form.control as any}
                  name={`serviceItems.${index}.frequencyLimit`}
                  label="Frequency Limit"
                  placeholder="1, 2, ...."
                  type="number"
                  min={0}
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
  );
}
