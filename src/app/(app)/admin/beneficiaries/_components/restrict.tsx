import { ConfirmDialog } from "@/components/overlays/ConfirmDialog";
import { PadlockIcon } from "@/components/svgs";
import { Button } from "@/components/ui/button";

const RestrictProfile = () => {
  return (
    <ConfirmDialog
      variant="danger"
      title="Restrict this enrollee?"
      description="Are you sure you want to restrict this enrollee?"
      confirmText="Yes, delete"
      cancelText="Cancel"
      onConfirm={async () => {
        console.log("restriction confirmed");
      }}
      trigger={
        <Button
          variant="outline"
          className="h-10 rounded-xl border border-[#D0D5DD] py-2.5 px-3.5 flex items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]"
        >
          <PadlockIcon /> Restrict Enrollee
        </Button>
      }
    />
  );
};

export default RestrictProfile;
