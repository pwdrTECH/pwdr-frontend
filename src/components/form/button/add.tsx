import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";

interface AddButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  icon?: ReactNode;
}

export function AddButon({
  text = "Add",
  onClick,
  icon = <Plus className="h-6 w-6" />,
}: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="h-10 w-fit rounded-[8px] px-[14px] py-[10px] text-white"
    >
      {icon}
      {text}
    </Button>
  );
}
