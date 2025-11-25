"use client";

import { TextField, TextareaField } from "@/components/form";
import { CancelButton, SubmitButton } from "@/components/form/button";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { EditIcon, NairaIcon } from "@/components/svgs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const planFormSchema = z.object({
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

export default function EditService() {
  const [open, setOpen] = React.useState(false);

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

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      serviceItems: serviceItems,
    },
  });

  const removeServiceItem = (id: string) => {
    const newItems = serviceItems.filter((item) => item.id !== id);
    setServiceItems(newItems);
    form.setValue("serviceItems", newItems);
  };

  const onSubmit = (data: PlanFormData) => {
    console.log("[v0] Form submitted with data:", data);
    alert("Plan updated successfully! Check console for data.");
  };

  return (
    <CustomSheet
      title="Edit Plan"
      subtitle="Edit Plans"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-[43.33px] hover:bg-gray-50 hover:text-[#344054] text-[#344054] py-0 font-bold text-[14.93px]/[21.33px] bg-transparent justify-start shadow-none  cursor-pointer"
        >
          <EditIcon />
          Edit
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
            formId="provider-form"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Update Plan"}
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
          {/* Service Items Section */}
          <div className="flex flex-col gap-0.5 font-hnd tracking-normal">
            <h2 className="text-[#101828] font-bold text-[18px]/[28px] mb-1">
              Service Items
            </h2>
            <p className="text-[#475467] text-[16px]/[21.33px] mb-6">
              Enter plan basic details
            </p>
          </div>

          <div className="space-y-6">
            {serviceItems.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between w-full">
                  <label
                    htmlFor="service"
                    className="font-hnd text-[18px]/[28px] font-bold  text-[#101828] tracking-normal"
                  >
                    Service {index + 1}
                  </label>
                  {serviceItems.length > 1 && (
                    <div className="w-11 h-11 bg-white py-2.5 px-[18px] flex gap-2 justify-center items-center">
                      <button
                        type="button"
                        onClick={() => removeServiceItem(item.id)}
                        className="w-6 h-6 border-[1.5px] border-[#98A2B3] rounded-xl  text-[#98A2B3] hover:text-gray-600 transition-colors flex items-center justify-center cursor-pointer"
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
                  placeholder="Enter your house number"
                  rows={3}
                />

                <TextField
                  control={form.control}
                  name={`serviceItems.${index}.cost`}
                  label="Cost"
                  placeholder="Enter amount"
                  type="number"
                  step="0.01"
                  min={0}
                  rightAdornment={<NairaIcon />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    control={form.control}
                    name={`serviceItems.${index}.utilizationLimit`}
                    label="Utilization Limit"
                    placeholder="Enter amount"
                    type="number"
                    min={0}
                    rightAdornment={<NairaIcon />}
                  />
                  <TextField
                    control={form.control}
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
        </form>
      </Form>
    </CustomSheet>
  );
}
