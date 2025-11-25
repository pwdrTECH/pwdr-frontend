"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TableContainerProps {
  children: ReactNode;
  className?: string;
}

export function TableContainer({ children, className }: TableContainerProps) {
  return (
    <div className={cn("w-full overflow-x-auto custom-scroll", className)}>
      <div className="min-w-full">{children}</div>
    </div>
  );
}

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-[#EAECF0]", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:nth-child(odd)]:bg-white [&_tr:nth-child(even)]:bg-[#F9FAFB] [&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-[#EEF1F6]",
        "[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-[#EAECF0]",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t border-[#EAECF0] font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-[#EAECF0] transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-[#475467] text-[12px]/[18px] tracking-normal h-11 py-3 px-6 bg-white text-left align-middle font-medium font-hnd whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-6 py-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5 text-[#475467] tracking-normal text-[14px]/[20px] font-hnd font-normal",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
