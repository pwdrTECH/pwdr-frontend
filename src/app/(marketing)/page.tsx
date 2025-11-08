import React from "react"
import { NavBar } from "./_components/NavBar"
import { Footer } from "./_components/Footer"

export default function HomePage() {
  return (
    <main className="min-h-dvh w-full bg-white text-[#0f1222]">
      <NavBar />
      <Footer />
    </main>
  )
}
