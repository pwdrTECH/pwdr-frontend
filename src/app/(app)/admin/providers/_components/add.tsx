"use client";

import { CheckboxGroup, SelectField, TextField } from "@/components/form";
import { AddButon, CancelButton, SubmitButton } from "@/components/form/button";
import { ConfirmPopover } from "@/components/overlays/ConfirmPopover";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { Form } from "@/components/ui/form";
import {
  NIGERIA_STATES_AND_LGAS,
  STATES,
  getLgasByStateId,
} from "@/lib/nigeria-lga";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const SCHEMES = ["NHIS", "PHIS", "TSHIP"] as const;

const schema = z.object({
  name: z.string().min(2, "Provider name is required"),
  adminEmail: z.string().email("Valid email required"),
  adminPhone: z.string().min(5, "Phone number required"),
  street: z.string().min(3, "Street address required"),
  state: z.string().min(1, "Select a state"),
  lga: z.string().min(1, "Select a local government"),
  schemes: z.array(z.string()).min(1, "Select at least one scheme"),
});

type FormValues = z.infer<typeof schema>;

export default function AddProvider() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      adminEmail: "",
      adminPhone: "",
      street: "",
      state: "",
      lga: "",
      schemes: [],
    },
    mode: "onSubmit",
  });

  const selectedState = useWatch({
    control: form.control,
    name: "state",
  });

  React.useEffect(() => {
    if (selectedState !== undefined) {
      form.setValue("lga", "", { shouldDirty: true });
    }
  }, [selectedState, form.setValue]);

  const stateOptions = React.useMemo(
    () =>
      STATES.map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    [],
  );

  const lgaOptions = React.useMemo(() => {
    if (!selectedState) return [];
    const stateId = Number.parseInt(selectedState, 10);
    if (Number.isNaN(stateId)) return [];

    const lgas = getLgasByStateId(stateId);
    return lgas.map((l) => ({ value: l, label: l }));
  }, [selectedState]);

  const onSubmit = (values: FormValues) => {
    const stateId = Number.parseInt(values.state, 10);

    const payload = {
      ...values,
      state_id: stateId,
      state_name: NIGERIA_STATES_AND_LGAS[stateId]?.name ?? "Unknown State",
    };

    console.log("Provider Created:", payload);
  };

  return (
    <CustomSheet
      title="Add Provider"
      subtitle="Create a profile for a partner provider"
      trigger={<AddButon text=" Add Provider" />}
      open={open}
      onOpenChange={setOpen}
      contentClassName="px-6"
      footer={
        <div className="flex w-full items-center justify-between">
          <ConfirmPopover
            variant="danger"
            title="Cancel Form?"
            confirmText="Yes, Cancel"
            trigger={<CancelButton text="Cancel" />}
            onConfirm={() => {
              form.reset();
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
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Add"}
          </SubmitButton>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="provider-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full sm:w-lg flex flex-col gap-[17.07px]"
        >
          {/* Provider Info */}
          <section className="space-y-[14px]">
            <TextField
              control={form.control}
              name="name"
              label="Name"
              placeholder="e.g. Ally Healthcare"
              inputClassName="h-10"
            />
            <TextField
              control={form.control}
              name="adminEmail"
              label="Admin Email"
              placeholder="admin@hmo.com"
              inputClassName="h-10"
              type="email"
            />
            <TextField
              control={form.control}
              name="adminPhone"
              label="Admin Phone No."
              placeholder="+234..."
              inputClassName="h-10"
              type="tel"
            />
          </section>

          {/* Address */}
          <section className="space-y-[14px]">
            <h3 className="text-[#101828] font-hnd font-bold text-[18px]/[28px]">
              Address
            </h3>

            <TextField
              control={form.control}
              name="street"
              label="Street"
              placeholder="Enter your street details"
              inputClassName="h-10"
            />

            <SelectField
              control={form.control}
              name="state"
              label="State"
              placeholder="Select state"
              options={stateOptions}
              triggerClassName="h-10"
            />

            <SelectField
              control={form.control}
              name="lga"
              label="Local Government"
              placeholder={
                selectedState
                  ? "Select local government"
                  : "Select a state first"
              }
              options={lgaOptions}
              triggerClassName="h-10"
              disabled={!selectedState}
            />
          </section>

          {/* Schemes */}
          <section className="space-y-[14px]">
            <div className="flex flex-col gap-1.5 font-hnd tracking-normal">
              <h3 className="text-[#101828] font-hnd font-bold text-[18px]/[28px]">
                Schemes
              </h3>
              <p className="text-[#475467] text-[16px]/[21.33px]">
                Select the schemes this provider covers.
              </p>
            </div>
            <CheckboxGroup
              control={form.control}
              name="schemes"
              label=""
              description="Select the schemes this provider covers."
              options={SCHEMES.map((s) => ({ label: s, value: s }))}
              orientation="vertical"
            />
          </section>

          {/* Hidden submit so SubmitButton works by formId */}
          <button type="submit" className="sr-only" />
        </form>
      </Form>
    </CustomSheet>
  );
}
