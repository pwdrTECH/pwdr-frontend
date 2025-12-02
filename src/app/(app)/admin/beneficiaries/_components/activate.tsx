"use client";

import { ConfirmDialog } from "@/components/overlays/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useActivateEnrollee } from "@/lib/api/beneficiaries";
import { toast } from "sonner";

// Minimal shape we actually need
type ActivatableEnrollee = {
  enrolee_id: string | null;
  active: 0 | 1 | number | null;
};

interface ActivateEnrolleeProps {
  enrollee: ActivatableEnrollee | null | undefined;
}

export function ActivateEnrollee({ enrollee }: ActivateEnrolleeProps) {
  const activateEnrollee = useActivateEnrollee();

  // No enrollee loaded – nothing to show
  if (!enrollee) return null;

  // Already active → show badge / disabled button

  const handleConfirm = async () => {
    if (!enrollee.enrolee_id) {
      toast.error("Missing enrollee ID");
      return;
    }

    try {
      await activateEnrollee.mutateAsync({
        enrolee_id: enrollee.enrolee_id,
      });

      toast.success("Enrollee activated successfully");
    } catch (err: any) {
      toast.error("Failed to activate enrollee", {
        description: err?.message ?? "Please try again.",
      });
    }
  };

  return (
    <ConfirmDialog
      variant="info"
      title="Activate Enrollee?"
      confirmText={
        activateEnrollee.isPending ? "Activating..." : "Yes, Activate"
      }
      onConfirm={handleConfirm}
      description={
        <p className="font-hnd font-normal text-[#667085] text-[16px]/[24px] tracking-normal space-y-2">
          You&apos;re about to activate this enrollee&apos;s coverage.
          <span className="block mt-2">
            Are you sure you want to proceed with this activation?
          </span>
        </p>
      }
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start h-10 border-0 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 text-emerald-700 text-[14px]/[20px] font-semibold flex items-center gap-2"
        >
          Activate Enrollee
        </Button>
      }
    />
  );
}
