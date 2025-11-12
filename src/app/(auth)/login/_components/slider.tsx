"use client"

import Image from "next/image"
import React from "react"

export function RightHeroSlider() {
  const slides = [
    {
      id: 1,
      img: "/images/login/graph.png",
      title: "Next-generation health insurance claims processing solution",
      kpiTitle: "Average Claims",
      kpiValue: "2,387",
      kpiDelta: "↗︎ 20% vs last month",
      amount: "₦18,941,144",
      amountDelta: "↗︎ ₦3,145,264 (+14%)",
    },
    {
      id: 2,
      img: "/images/login/graph.png",
      title: "AI-assisted fraud detection triage & explainable flags",
      kpiTitle: "Risk Flags",
      kpiValue: "312",
      kpiDelta: "↘︎ 6% false positives",
      amount: "₦12,503,912",
      amountDelta: "↗︎ ₦1,105,228 (+10%)",
    },
    {
      id: 3,
      img: "/images/login/graph.png",
      title: "Faster turnaround time SLA tracking & nudges",
      kpiTitle: "Cycle Time",
      kpiValue: "18h",
      kpiDelta: "↘︎ −24% vs baseline",
      amount: "₦9,704,220",
      amountDelta: "↗︎ ₦742,180 (+8%)",
    },
  ] as const

  const [index, setIndex] = React.useState(0)
  const total = slides.length
  const active = slides[index]

  // Auto-advance (pause on hover/focus)
  const [paused, setPaused] = React.useState(false)
  React.useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, 6000)
    return () => clearInterval(t)
  }, [paused, total])

  // Keyboard arrows
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total)
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [total])

  // Simple touch swipe
  const startX = React.useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = startX.current
    if (s == null) return
    const dx = e.changedTouches[0].clientX - s
    if (Math.abs(dx) > 40) {
      setIndex((i) => (dx < 0 ? (i + 1) % total : (i - 1 + total) % total))
    }
    startX.current = null
  }

  return (
    <aside className="order-1 hidden overflow-hidden py-4 pr-4 md:order-2 md:block">
      <div
        className="relative h-full w-full rounded-[28px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 rounded-[28px]"
          style={{
            background:
              "linear-gradient(148.37deg, #017FA5 4.96%, #6B7280 53.65%, #00303F 98.6%)",
          }}
        />

        {/* Foreground dots (tiled texture) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px]"
          style={{
            backgroundImage: "url('/images/login/bg.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
            backgroundPosition: "top left",
            imageRendering: "pixelated",
            opacity: 0.5,
            mixBlendMode: "normal",
          }}
        />

        {/* Slide container */}
        <div className="absolute inset-0">
          {slides.map((s, i) => (
            <Slide key={s.id} slide={s} active={i === index} />
          ))}
        </div>

        {/* Caption */}
        <div className="pointer-events-none absolute bottom-[15%] left-1/2 w-[90%] max-w-[640px] -translate-x-1/2">
          <p
            aria-live="polite"
            className="font-hnd text-[30px]/[30px] tracking-[-0.06em] text-center text-[#FAFAFA]"
          >
            {active.title}
          </p>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition",
                  i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

/* --- Single slide --- */
function Slide({
  slide,
  active,
}: {
  slide: {
    id: number
    img: string
    title: string
    kpiTitle: string
    kpiValue: string
    kpiDelta: string
    amount: string
    amountDelta: string
  }
  active: boolean
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ease-out",
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Bigger centered image */}
      <div className="relative z-10 w-full max-w-[780px] aspect-[3/2] -translate-y-3">
        <Image
          src={slide.img}
          alt="chart"
          fill
          sizes="(min-width: 1536px) 640px, (min-width: 1280px) 580px, (min-width: 1024px) 500px, 80vw"
          className="object-contain"
          priority={active}
        />
      </div>
    </div>
  )
}

/* Utility for joining classNames */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}
