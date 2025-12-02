import type { MouseEventHandler } from "react";
import { Button } from "@/components/ui/button";

interface CancelButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  disabled?: boolean;
  className?: string;
}
export function CancelButton({
  disabled,
  onClick,
  className,
  text = "Cancel",
}: CancelButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {text}
    </Button>
  );
}
