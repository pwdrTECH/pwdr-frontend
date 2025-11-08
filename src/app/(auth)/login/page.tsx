"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLogo } from "@/components/svgs/logo"
import { RightHeroSlider } from "./_components/slider"
import MailIcon from "@/components/svgs"
import { LoginForm } from "./_components/form"

// Optional: replace with your SVG
function PowderWordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-5 w-5 rounded-sm bg-[var(--brand,#4C1CE0)]" />
      <span className="text-lg font-semibold tracking-wide">POWDER</span>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("admin@domain.com")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // mock submit
    setTimeout(() => {
      setLoading(false)
      router.push("/preview")
    }, 800)
  }

  return (
    <main className="min-h-dvh w-full bg-white text-foreground">
      <div className="w-full grid min-h-dvh  grid-cols-1 md:grid-cols-[1fr_1.05fr]">
        {/* LEFT COLUMN */}
        <section className="w-full h-full relative order-2 px-4 py-10 sm:px-8 md:order-1 md:flex md:flex-col md:justify-center">
          <div className="h-full max-w-[403.82px] mx-auto w-full flex flex-col justify-between items-center">
            <div className="mb-14 mt-2 md:mb-16">
              <Link
                href="/"
                aria-label="Powder home"
                className="flex items-center gap-2"
              >
                <AppLogo className="text-black" />
              </Link>
            </div>

            <div className="w-full sm:w-[440px] flex flex-col gap-[35.9px]">
              <h1 className="mt-2 text-[15px] text-[#6b6e7d] text-center">
                Access and manage your claims
              </h1>
              <div className="w-full flex flex-col gap-[26.6px] pt-[19.49px] pb-[24.49px] px-[19.49px] rounded-[13.46px] border border-[#0000000D] bg-[#F8F8F8]">
                <LoginForm />
              </div>
            </div>
            <div></div>
            {/* footer small */}
          </div>
          <div className="w-full mt-10 flex flex-wrap items-center justify-end gap-3 text-[12px] text-right text-[#8c90a3]">
            <Link
              href="mailto:help@powder.health"
              className="hover:text-[#0f1222] flex items-center gap-[7.37px]"
            >
              help@powder.health <MailIcon />
            </Link>
          </div>
        </section>

        {/* RIGHT COLUMN – gradient hero */}
        <RightHeroSlider />
      </div>
    </main>
  )
}
