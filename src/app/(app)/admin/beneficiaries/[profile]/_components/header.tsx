"use client";

import {
  CopyIcon,
  EmailIcon,
  LocationIcon,
  PhoneIcon,
} from "@/components/svgs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { EnrolleeDetail } from "@/lib/api/beneficiaries";
import { format } from "date-fns";

interface ProfileHeaderProps {
  enrollee?: EnrolleeDetail | null;
  name: string;
}

export function ProfileHeader({ enrollee, name }: ProfileHeaderProps) {
  const code = enrollee?.enrolee_id ?? "—";

  const dob = enrollee?.dob
    ? format(new Date(enrollee.dob), "MMMM d, yyyy")
    : "—";

  // Fully safe gender formatter
  const gender = enrollee?.gender
    ? enrollee.gender.charAt(0).toUpperCase() +
      enrollee.gender.slice(1).toLowerCase()
    : "—";

  const email = enrollee?.email ?? "—";
  const phone = enrollee?.phone ?? "—";

  // Safe address concatenation
  const address =
    enrollee?.address ||
    [enrollee?.city, enrollee?.state_name].filter(Boolean).join(", ") ||
    "—";

  const passport = enrollee?.passport || null;

  const initials = name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row max-w-[768px] gap-[34px]">
        <div className="flex gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-[100px] h-[100px] bg-[#F8F8F8] border-3 border-white shadow-[0px_0px_0px_3px_#1671D9]">
              <AvatarImage src={passport ?? "/images/default-avatar.png"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* Name, Code, DOB, Gender */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex flex-col">
                <h4 className="text-[24px] font-hnd font-medium text-[#404040] tracking-normal">
                  {name}
                  <span className="text-[#726E75] font-medium text-[16px] font-hnd flex items-center gap-1 -mt-2.5">
                    {code}
                    <Button
                      variant="ghost"
                      className="w-fit hover:bg-transparent"
                    >
                      <CopyIcon />
                    </Button>
                  </span>
                </h4>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-[9px]">
                  <p className="text-[#726E75] text-[16px] font-hnd font-medium">
                    DOB:
                  </p>
                  <p className="text-[#474747] font-hnd font-medium text-base">
                    {dob}
                  </p>
                </div>

                <div className="flex items-center gap-[9px]">
                  <p className="text-[#726E75] text-[16px] font-hnd font-medium">
                    Gender:
                  </p>
                  <p className="text-[#474747] font-hnd font-medium text-base">
                    {gender}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[9px]">
            <EmailIcon />
            <p className="text-[16px]/[21.33px] text-[#4A4949] font-hnd">
              {email}
            </p>
          </div>

          <div className="flex items-center gap-[9px]">
            <PhoneIcon />
            <p className="text-[16px]/[21.33px] text-[#4A4949] font-hnd">
              {phone}
            </p>
          </div>

          <div className="flex items-center gap-[9px]">
            <LocationIcon />
            <p className="text-[16px]/[21.33px] text-[#4A4949] font-hnd">
              {address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
