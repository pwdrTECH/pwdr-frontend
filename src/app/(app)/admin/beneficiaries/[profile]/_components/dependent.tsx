"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AddDependence } from "./add-dependent"

export function DependentsSection() {
  const dependents = [
    {
      id: 1,
      name: "John Doe",
      dob: "June 27, 1993",
      gender: "Male",
      image: "/images/profile.jpg",
    },
    {
      id: 2,
      name: "John Doe",
      dob: "June 27, 1993",
      gender: "Male",
      image: "/images/sahab.jpg",
    },
    {
      id: 3,
      name: "John Doe",
      dob: "June 27, 1993",
      gender: "Male",
      image: "/images/profile.jpg",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-hnd font-bold text-[#5F656B]">
            Dependents
          </h3>
          <Badge className="w-6 h-[17px] bg-[#CC0C16] text-white px-2 rounded-[10px]">
            3
          </Badge>
        </div>
        <AddDependence />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {dependents.map((dep) => (
          <div
            key={dep.id}
            className="w-full flex gap-[17px] rounded-2xl py-6 px-3 border border-[#EAECF0]"
          >
            <div className="flex gap-[18px]">
              <Avatar className="w-16 h-16">
                <AvatarImage src={dep.image} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-[5px]">
                <p className="font-hnd font-normal text-black text-[16px]/[25.6px]">
                  {dep.name}
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
                <span className="text-[#474747] font-medium">{dep.dob}</span>
              </p>
              <p className="text-[13px] text-[#667085] font-normal font-hnd tracking-normal">
                Gender:{" "}
                <span className="text-[#474747] font-medium">{dep.gender}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
