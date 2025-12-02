"use client";

import { ConfirmPopover } from "@/components/overlays/ConfirmPopover";
import { Button } from "@/components/ui/button";
import { useDeactivateEnrollee } from "@/lib/api/schemes";
import { PowerIcon } from "lucide-react";
import { toast } from "sonner";

type ActivatableEnrollee = {
  enrolee_id: string | null;
  active: 0 | 1 | number | null;
};

interface DeactivateEnrolleeProps {
  enrollee: ActivatableEnrollee | null | undefined;
}

export function DeactivateEnrollee({ enrollee }: DeactivateEnrolleeProps) {
  const deactivateEnrollee = useDeactivateEnrollee();

  if (!enrollee) return null;

  const isInactive =
    enrollee.active === 0 ||
    enrollee.active === null ||
    enrollee.active === undefined;

  const handleConfirm = async () => {
    if (!enrollee.enrolee_id) {
      toast.error("Missing enrollee ID");
      return;
    }

    try {
      await deactivateEnrollee.mutateAsync({
        enrolee_id: enrollee.enrolee_id,
      });

      toast.success("Enrollee deactivated successfully");
    } catch (err: any) {
      toast.error("Failed to deactivate enrollee", {
        description: err?.message ?? "Please try again.",
      });
    }
  };

  return (
    <ConfirmPopover
      variant="danger"
      title="Deactivate Enrollee?"
      confirmText={
        deactivateEnrollee.isPending ? "Deactivating..." : "Yes, Deactivate"
      }
      onConfirm={handleConfirm}
      description={
        <p className="font-hnd font-normal text-[#667085] text-[16px]/[24px] tracking-normal space-y-2">
          You&apos;re about to deactivate this enrollee&apos;s coverage.
          <span className="block mt-2">
            Are you sure you want to proceed with this deactivation?
          </span>
        </p>
      }
      trigger={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={deactivateEnrollee.isPending || isInactive}
          className="w-full p-1 border-0 hover:border-0
                            bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
        >
          <PowerIcon className="h-4 w-4 rotate-180" />
          {isInactive
            ? "Enrollee Inactive"
            : deactivateEnrollee.isPending
              ? "Deactivating..."
              : "Deactivate Enrollee"}
        </Button>
      }
    />
  );
}
