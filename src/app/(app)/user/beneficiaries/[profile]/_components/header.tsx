"use client"
import {
  CircledUpArrow,
  CopyIcon,
  EditAltIcon,
  EmailIcon,
  LocationIcon,
  PadlockIcon,
  PhoneIcon,
} from "@/components/svgs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, MapPin, Phone } from "lucide-react"
import { ProfileStats } from "./stats"

export function ProfileHeader() {
  return (
    <div className="flex flex-col gap-4">
      {/* Action Buttons */}

      {/* Profile Card */}
      <div className="w-full flex flex-col sm:flex-row max-w-[768px] gap-[34px]">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <Avatar className="w-[100px] h-[100px] bg-[#F8F8F8] border-3 border-white shadow-[0px_0px_0px_3px_#1671D9]">
              <AvatarImage src="/images/sahab.jpg" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1">
              <div className="flex flex-col">
                <h4 className="text-[24px] font-hnd font-medium text-[#404040] tracking-normal">
                  Muhammad Sahab
                  <span className="text-[#726E75] font-medium text-[16px] font-hnd flex items-center gap-1 -mt-2.5">
                    SHTL/CAC/11081{" "}
                    <Button
                      variant="ghost"
                      className="w-fit hover:bg-transparent"
                    >
                      <CopyIcon />
                    </Button>
                  </span>
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-[9px]">
                  <p className="text-[#726E75] text-[16px] font-hnd font-medium tracking-normal">
                    DOB:
                  </p>
                  <p className="text-[#474747] font-hnd font-medium text-base tracking-normal">
                    June 27, 1993
                  </p>
                </div>
                <div className="flex items-center gap-[9px]">
                  <p className="text-[#726E75] text-[16px] font-hnd font-medium tracking-normal">
                    Gender:
                  </p>
                  <p className="text-[#474747] font-hnd font-medium text-base tracking-normal">
                    Male
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-[9px]">
            <EmailIcon />

            <p className="text-[16px]/[21.33px] text-[#4A4949] font-hnd font-normal tracking-normal">
              muhammedsahab@gmail.com
            </p>
          </div>
          <div className="flex items-center gap-[9px]">
            <PhoneIcon />

            <p className="text-[16px]/[21.33px] text-[#4A4949] font-hnd font-normal tracking-normal">
              +234 903 849 2923
            </p>
          </div>
          <div className="flex items-center gap-[9px]">
            <LocationIcon />

            <p className="text-[16px]/[21.33px] text-[#4A4949] font-hnd font-normal tracking-normal">
              17, ABC Street, Galadimawa, Abuja
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
