"use client";

import { ConfirmDialog } from "@/components/overlays/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useDeleteEnrollee } from "@/lib/api/beneficiaries";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type DeletableEnrollee = {
  enrolee_id: string | null;
};

interface DeleteEnrolleeProps {
  enrollee: DeletableEnrollee | null | undefined;
}

export function DeleteEnrollee({ enrollee }: DeleteEnrolleeProps) {
  const deleteEnrollee = useDeleteEnrollee();

  if (!enrollee) return null;

  const handleConfirm = async () => {
    if (!enrollee.enrolee_id) {
      toast.error("Missing enrollee ID");
      return;
    }

    try {
      await deleteEnrollee.mutateAsync({
        enrolee_id: enrollee.enrolee_id,
      });

      toast.success("Enrollee deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete enrollee", {
        description: err?.message ?? "Please try again.",
      });
    }
  };

  return (
    <ConfirmDialog
      variant="danger"
      title="Delete Enrollee?"
      confirmText={deleteEnrollee.isPending ? "Deleting..." : "Yes, Delete"}
      onConfirm={handleConfirm}
      description={
        <p className="font-hnd text-[#667085] text-[16px]/[24px] tracking-normal">
          This action will permanently delete this enrollee.
          <span className="block mt-2">
            This cannot be undone. Do you wish to continue?
          </span>
        </p>
      }
      trigger={
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={deleteEnrollee.isPending}
          className="h-10 rounded-xl py-2.5 px-3.5 flex items-center gap-2 border-0 hover:border-0"
        >
          <Trash2 className="h-4 w-4" />
          {deleteEnrollee.isPending ? "Deleting..." : "Delete Enrollee"}
        </Button>
      }
    />
  );
}
