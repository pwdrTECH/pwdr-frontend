import { AppLogo } from "@/components/svgs/logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer
      className="min-h-[204.13px] flex flex-col gap-[28px] py-12 px-20"
      style={{
        background:
          "radial-gradient(51.28% 112.18% at 89.05% 183.63%, #682D8F 0%, #1D1148 100%)",
      }}
    >
      <div className="w-full mx-auto  h-[72px] xl:w-[1440px] flex items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-20">
        <Link href="#" className="flex items-center gap-2">
          <AppLogo className="text-white" />{" "}
        </Link>
        <div className="w-[] flex items-center gap-6 lg:gap-9 text-white text-base leading-[120%] tracking-normal font-hnd font-bold">
          <Link className="cursor-pointer" href="#">
            Products
          </Link>
          <Link className="cursor-pointer" href="#">
            Company
          </Link>
          <Link className="cursor-pointer" href="#">
            Blog
          </Link>
        </div>
        <div className="hidden md:flex w-[156px] items-center justify-end">
          <Link
            href="/signup"
            className="h-9 rounded-[8px] bg-[#4C1CE0] px-3 hover:bg-[#4C1CE0]/85 inline-flex items-center justify-center gap-2 whitespace-nowrap text-base text-white leading-[120%] tracking-normal font-hnd font-bold transition-all cursor-pointer"
          >
            Get started
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-[11px] text-[#6b6e7d]">
            © {new Date().getFullYear()} Powder. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
