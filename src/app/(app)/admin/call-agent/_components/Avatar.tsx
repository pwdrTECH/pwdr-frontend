import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Presence = "online" | "away" | "ongoing" | "offline"

const PRESENCE_COLOR: Record<Presence, string> = {
  online: "bg-[#1671D9]",
  away: "bg-amber-500",
  ongoing: "bg-[#2FB969]",
  offline: "bg-slate-400",
}

export function AvatarWithStatus({
  src = "/images/profile.jpg",
  initials = "CN",
  presence = "online",
  size = 8,
  ai = false,
}: {
  src?: string
  initials?: string
  presence?: Presence
  size?: 8 | 10 | 12 | 14 | 16
  ai?: boolean
}) {
  return (
    <div className="inline-block relative">
      <Avatar className={`h-${size} w-${size}`}>
        <AvatarImage
          src={ai ? "/half-logo.svg" : src}
          className="w-8 h-8 object-center object-cover bg-[#D9D9D9]/40 border-2 border-white rounded-full"
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span
        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full z-10 ${PRESENCE_COLOR[presence]}
                      ring-2 ring-white`}
        aria-label={presence}
        title={presence[0].toUpperCase() + presence.slice(1)}
      />
    </div>
  )
}
