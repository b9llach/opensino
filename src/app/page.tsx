import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-4">welcome to shitstake.</p>
          </div>
        </div>
      </div>

    </div>
  )
}