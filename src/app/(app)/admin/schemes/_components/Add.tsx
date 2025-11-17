"use client";

import {
  SelectField,
  TextField,
  TextareaField,
  type SelectOption,
} from "@/components/form";
import { AddButon, CancelButton, SubmitButton } from "@/components/form/button";
import { ConfirmPopover } from "@/components/overlays/ConfirmPopover";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { NairaIcon } from "@/components/svgs";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, X } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSchemes, useCreatePlan } from "@/lib/api/schemes";
import { toast } from "sonner";

const planFormSchema = z
  .object({
    planName: z
      .string()
      .min(1, "Plan name is required")
      .min(3, "Plan name must be at least 3 characters"),
    // store selected scheme IDs as strings
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
  })
  // field only used to drive the SelectField; we move its value into `schemes`
  .extend({
    schemeSelector: z.string().optional(),
  });

type PlanFormData = z.infer<typeof planFormSchema>;

export default function AddPlanForm() {
  const [open, setOpen] = React.useState(false);

  // local state only tracks the service "rows" (ids), values live in RHF
  const [serviceItems, setServiceItems] = React.useState<
    Array<{
      id: string;
      name: string;
      cost: string;
      utilizationLimit: string;
      frequencyLimit: string;
    }>
  >([
    { id: "1", name: "", cost: "", utilizationLimit: "", frequencyLimit: "" },
  ]);

  const { data: schemes, isLoading: schemesLoading } = useSchemes();
  const createPlan = useCreatePlan();

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: "",
      schemes: [],
      premium: "",
      threshold: "",
      daysToActivate: "",
      serviceItems,
      schemeSelector: "",
    },
  });

  // Build select options from API
  const schemeOptions: SelectOption[] = React.useMemo(
    () =>
      (schemes ?? []).map((s) => ({
        value: String(s.id), // store ID
        label: s.name,
      })),
    [schemes],
  );

  const selectedSchemeIds = form.watch("schemes") || [];
  const schemeSelector = form.watch("schemeSelector");

  // Whenever schemeSelector changes, add to `schemes` array and clear selector
  React.useEffect(() => {
    if (!schemeSelector) return;
    if (!selectedSchemeIds.includes(schemeSelector)) {
      const next = [...selectedSchemeIds, schemeSelector];
      form.setValue("schemes", next, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    // clear the selector so dropdown goes back to placeholder
    form.setValue("schemeSelector", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [schemeSelector, selectedSchemeIds, form]);

  const getSchemeLabel = (schemeId: string) =>
    schemeOptions.find((o) => o.value === schemeId)?.label ?? schemeId;

  const removeScheme = (schemeId: string) => {
    const next = selectedSchemeIds.filter((id) => id !== schemeId);
    form.setValue("schemes", next, { shouldDirty: true, shouldValidate: true });
  };

  const removeServiceItem = (id: string) => {
    const current = form.getValues("serviceItems");
    const next = current.filter((item) => item.id !== id);
    setServiceItems(next);
    form.setValue("serviceItems", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addServiceItem = () => {
    const current = form.getValues("serviceItems");
    const maxId = current.reduce(
      (max, item) => Math.max(max, Number.parseInt(item.id) || 0),
      0,
    );
    const newId = String(maxId + 1);

    const next = [
      ...current,
      {
        id: newId,
        name: "",
        cost: "",
        utilizationLimit: "",
        frequencyLimit: "",
      },
    ];

    setServiceItems(next);
    form.setValue("serviceItems", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      // Backend expects:
      // {
      //   "scheme_id": 1,
      //   "name": "Gold",
      //   "premium": "150000",
      //   "utilization_threshold": "80",
      //   "days_to_activate": "7",
      //   "services": [ ... ]
      // }
      const primarySchemeId = Number(data.schemes[0]); // use first selected scheme

      const payload = {
        scheme_id: primarySchemeId,
        name: data.planName.trim(),
        premium: data.premium,
        utilization_threshold: data.threshold,
        days_to_activate: data.daysToActivate,
        services: data.serviceItems.map((item) => ({
          // if you have real HMO ID from auth, plug it here instead
          hmo_id: primarySchemeId,
          name: item.name,
          cost: item.cost,
          utilization_limit: item.utilizationLimit,
          frequency_limit: item.frequencyLimit,
          status: "active",
          active: 1,
          deleted: 0,
        })),
      };

      // Call the real API
      await createPlan.mutateAsync(payload as any);

      toast.success("Plan created successfully");

      // Reset form + service items + close sheet
      form.reset({
        planName: "",
        schemes: [],
        premium: "",
        threshold: "",
        daysToActivate: "",
        serviceItems: [
          {
            id: "1",
            name: "",
            cost: "",
            utilizationLimit: "",
            frequencyLimit: "",
          },
        ],
        schemeSelector: "",
      });
      setServiceItems([
        {
          id: "1",
          name: "",
          cost: "",
          utilizationLimit: "",
          frequencyLimit: "",
        },
      ]);
      setOpen(false);
    } catch (err: any) {
      console.error("[plan] create error:", err);
      toast.error(err?.message || "Failed to create plan");
    }
  };

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
              form.reset({
                planName: "",
                schemes: [],
                premium: "",
                threshold: "",
                daysToActivate: "",
                serviceItems: [
                  {
                    id: "1",
                    name: "",
                    cost: "",
                    utilizationLimit: "",
                    frequencyLimit: "",
                  },
                ],
                schemeSelector: "",
              });
              setServiceItems([
                {
                  id: "1",
                  name: "",
                  cost: "",
                  utilizationLimit: "",
                  frequencyLimit: "",
                },
              ]);
              setOpen(false);
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
            disabled={
              form.formState.isSubmitting || createPlan.isPending === true
            }
          >
            {form.formState.isSubmitting || createPlan.isPending
              ? "Saving..."
              : "Add Plan"}
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
            <SelectField
              control={form.control}
              name="schemeSelector"
              label="Scheme"
              options={schemeOptions}
              triggerClassName="justify-start"
              triggerAriaLabel="Scheme"
              placeholder={
                schemesLoading
                  ? "Loading schemes..."
                  : schemeOptions.length
                    ? "Select schemes this plan applies to"
                    : "No schemes available"
              }
              disabled={schemesLoading || !schemeOptions.length}
            />

            {/* Selected Scheme Tags */}
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
                  <label
                    htmlFor="service"
                    className="font-hnd text-[18px]/[28px] font-bold text-[#101828]"
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
  );
}
