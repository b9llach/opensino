import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4483E3] to-[#3472D2] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to OpenSino</h1>
            <p className="text-xl text-white/80 max-w-2xl">
              A poorly made version of Stake, but without real money.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}