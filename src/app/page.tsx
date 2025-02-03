import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500 animate-gradient">
            Opensino
          </h1>
          <p className="text-2xl text-zinc-400">Experience the Thrill of Fortune</p>
          <p className="text-zinc-500">Choose your game and start your winning journey</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Slots Card */}
          <Link href="/games/slots" className="group">
            <Card className="border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-zinc-800/50">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white">Slots</CardTitle>
                <CardDescription className="text-zinc-400">
                  Spin to Win Big! Try our exciting slot machines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-zinc-400">
                  <span>🎰</span>
                  <span>💎</span>
                  <span>🎲</span>
                </div>
                <Button variant="secondary" className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-white">
                  Play Slots <span className="ml-2">→</span>
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Blackjack Card */}
          <Link href="/games/blackjack" className="group">
            <Card className="border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-zinc-800/50">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white">Blackjack</CardTitle>
                <CardDescription className="text-zinc-400">
                  Test your skills against the dealer in this classic card game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-zinc-400">
                  <span>♠️</span>
                  <span>♥️</span>
                  <span>♣️</span>
                  <span>♦️</span>
                </div>
                <Button variant="secondary" className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-white">
                  Play Blackjack <span className="ml-2">→</span>
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-black/90 backdrop-blur-sm border-t border-zinc-800/50 p-4 text-center">
        <p className="text-zinc-500">Please gamble responsibly. Must be 18+ to play.</p>
      </footer>
    </div>
  );
}
