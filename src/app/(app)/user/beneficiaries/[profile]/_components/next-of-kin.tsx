"use client"

export function NextOfKinSection() {
  return (
    <div className="flex flex-col gap-[19px] rounded-3xl border border-[#EAECF0] pb-4">
      <div className="bg-[#EFEFEF59] h-[58px] gap-2 border-b py-[19px] px-4">
        <h3 className="text-[16px]/[20px] font-hnd font-bold text-[#5F656B] tracking-normal">
          Next of Kin
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 px-4">
        <div>
          <p className="text-[#515151] font-hnd text-[14px]/[18px] tracking-normal">
            John Doe
          </p>
        </div>

        <div className="flex flex-col">
          <p className="text-[#515151] font-hnd text-[14px]/[18px] tracking-normal">
            Johndoe@gmail.com
          </p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449] tracking-normal">
            +234 903 849 2923
          </p>
        </div>
      </div>
    </div>
  )
}
