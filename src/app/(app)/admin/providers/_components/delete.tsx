"use client";

import { ConfirmDialog } from "@/components/overlays/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useDeleteProvider } from "@/lib/api/provider";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Deletableprovider = {
  provider_id?: string | null;
};

interface DeleteproviderProps {
  provider: Deletableprovider | null | undefined;
}

export function DeleteProvider({ provider }: DeleteproviderProps) {
  const deleteprovider = useDeleteProvider();

  if (!provider) return null;

  const handleConfirm = async () => {
    if (!provider.provider_id) {
      toast.error("Missing provider ID");
      return;
    }

    try {
      await deleteprovider.mutateAsync({
        provider_id: provider.provider_id,
      });

      toast.success("Provider deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete provider", {
        description: err?.message ?? "Please try again.",
      });
    }
  };

  return (
    <ConfirmDialog
      variant="danger"
      title="Delete provider?"
      confirmText={deleteprovider.isPending ? "Deleting..." : "Yes, Delete"}
      onConfirm={handleConfirm}
      description={
        <p className="font-hnd text-[#667085] text-[16px]/[24px] tracking-normal">
          This action will permanently delete this provider.
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
          disabled={deleteprovider.isPending}
          className="h-10 rounded-xl py-2.5 px-3.5 flex items-center gap-2 border-0 hover:border-0"
        >
          <Trash2 className="h-4 w-4" />
          {deleteprovider.isPending ? "Deleting..." : "Delete provider"}
        </Button>
      }
    />
  );
}
