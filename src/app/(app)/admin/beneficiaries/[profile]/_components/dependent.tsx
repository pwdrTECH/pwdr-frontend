"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { EnrolleeDetail } from "@/lib/api/beneficiaries";
import { format } from "date-fns";
import { AddDependence } from "./add-dependent";

interface DependentsSectionProps {
  enrollee?: EnrolleeDetail | null;
  /**
   * Optional list of dependents for this principal.
   * You can wire this later from a dedicated dependents API.
   */
  dependents?: EnrolleeDetail[];
}

function getInitials(...parts: Array<string | null | undefined>): string {
  const letters = parts
    .filter(Boolean)
    .flatMap((p) => (p as string).split(" "))
    .map((chunk) => chunk[0]?.toUpperCase())
    .filter(Boolean);

  return letters.slice(0, 2).join("") || "DP";
}

export function DependentsSection({
  enrollee,
  dependents = [],
}: DependentsSectionProps) {
  // If this enrollee is a *dependent*, you might want to hide this section
  // and only show it for principals. You can tweak this logic as needed.
  const isPrincipal = enrollee?.user_role === "principal";

  // For now, we just rely on the dependents prop (empty array by default)
  const count = dependents.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-hnd font-bold text-[#5F656B]">
            Dependents
          </h3>
          <Badge className="min-w-6 h-[17px] bg-[#CC0C16] text-white px-2 rounded-[10px] flex items-center justify-center text-[11px]">
            {count}
          </Badge>
        </div>

        {/* Show AddDependence only for principals (optional business rule) */}
        {isPrincipal && <AddDependence />}
      </div>

      {/* No dependents state */}
      {count === 0 && (
        <div className="w-full rounded-2xl border border-dashed border-[#EAECF0] py-6 px-4 text-sm text-[#667085]">
          No dependents have been added for this enrollee yet.
        </div>
      )}

      {count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dependents.map((dep) => {
            const fullName =
              [dep.first_name, dep.other_names, dep.surname]
                .filter(Boolean)
                .join(" ") || dep.enrolee_id;

            const dob = dep.dob
              ? format(new Date(dep.dob), "MMMM d, yyyy")
              : "—";

            const gender = dep.gender
              ? dep.gender.charAt(0).toUpperCase() +
                dep.gender.slice(1).toLowerCase()
              : "—";

            const initials = getInitials(
              dep.first_name,
              dep.other_names,
              dep.surname,
            );

            return (
              <div
                key={dep.id}
                className="w-full flex gap-[17px] rounded-2xl py-6 px-3 border border-[#EAECF0]"
              >
                <div className="flex gap-[18px]">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={dep.passport ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-[5px]">
                    <p className="font-hnd font-normal text-black text-[16px]/[25.6px]">
                      {fullName}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[14px]/[14px] font-hnd font-normal tracking-normal py-1 px-2 bg-[#CE0FD91A] text-[#CE0FD9] border-0 mt-1"
                    >
                      Dependent
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-[5px]">
                  <p className="text-[13px] text-[#667085] font-normal font-hnd tracking-normal">
                    DOB:{" "}
                    <span className="text-[#474747] font-medium">{dob}</span>
                  </p>
                  <p className="text-[13px] text-[#667085] font-normal font-hnd tracking-normal">
                    Gender:{" "}
                    <span className="text-[#474747] font-medium">{gender}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
