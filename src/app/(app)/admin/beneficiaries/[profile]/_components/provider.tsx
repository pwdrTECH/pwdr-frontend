"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Building2, Mail, MapPin, Phone } from "lucide-react"

export function ProviderSection() {
  const providers = [
    { name: "Hospital XYZ", code: "SHTL/CAC/11081", amount: "N 350,304" },
    { name: "Hospital XYZ", code: "SHTL/CAC/11081", amount: "N 132,900" },
    { name: "Hospital XYZ", code: "SHTL/CAC/11081", amount: "N 50,000" },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Provider</h3>

      <div className="space-y-6">
        <div>
          <p className="text-slate-600 text-sm mb-3">Top Provider</p>
          <div className="space-y-3">
            {providers.map((provider, i) => (
              <div
                key={`provider-${i + 1}`}
                className="flex items-center gap-3"
              >
                <Avatar className="w-10 h-10 bg-blue-600 flex-shrink-0">
                  <AvatarFallback className="text-white">
                    <Building2 className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">
                    {provider.name}
                  </p>
                  <p className="text-xs text-slate-600">{provider.code}</p>
                </div>
                <p className="font-medium text-slate-900 flex-shrink-0">
                  {provider.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-slate-600 text-sm mb-3">Others</p>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-blue-600 flex-shrink-0">
              <AvatarFallback className="text-white">
                <Building2 className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm">Hospital XYZ</p>
              <p className="text-xs text-slate-600">SHTL/CAC/11081</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-slate-600 text-sm font-medium mb-3">Next Of Kin</p>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-slate-900 text-sm">John Doe</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600">Johndoe@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600">+234 903 849 2923</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600">
                17, ABC Street, Galadimawa, Abuja
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
