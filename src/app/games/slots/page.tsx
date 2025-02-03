'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

type Symbol = '💎' | '🟨' | '🟩' | '🟦' | '👨' | '👩' | '🖼️' | '🎨' | '📜'
type Reel = Symbol[]

interface PayLine {
  positions: number[] // Array of positions for each reel (0-2 for 3 rows)
  multiplier: { [key in Symbol]?: number }
}

export default function SlotsGame() {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('slotsBalance')
    return savedBalance ? parseInt(savedBalance) : 1000
  })
  const [currentBet, setCurrentBet] = useState(0)
  const [betPerLine, setBetPerLine] = useState(1) // In cents
  const [linesPlayed, setLinesPlayed] = useState(20) // Fixed at 20 lines for Da Vinci Diamonds
  const [message, setMessage] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState<Symbol[][]>([
    ['💎', '🟨', '🟩', '🟦', '👨'],
    ['👩', '🖼️', '🎨', '📜', '💎'],
    ['🟨', '🟩', '🟦', '👨', '👩'],
    ['🖼️', '🎨', '📜', '💎', '🟨'],
    ['🟩', '🟦', '👨', '👩', '🖼️']
  ])
  const [activePaylines, setActivePaylines] = useState<number[]>([])
  const [totalWin, setTotalWin] = useState(0)
  const [isTumbling, setIsTumbling] = useState(false)

  const bettingCircleRef = useRef<HTMLDivElement>(null)

  // Symbols with their base values
  const symbols: { [key: string]: { name: string, value: number } } = {
    '💎': { name: 'Diamond', value: 1000 }, // High value gem
    '🟨': { name: 'Yellow Gem', value: 500 },
    '🟩': { name: 'Green Gem', value: 250 },
    '🟦': { name: 'Blue Gem', value: 100 },
    '👨': { name: 'Da Vinci', value: 2000 }, // Highest value symbol
    '👩': { name: 'Mona Lisa', value: 1500 },
    '🖼️': { name: 'Painting', value: 750 },
    '🎨': { name: 'Palette', value: 400 },
    '📜': { name: 'Scroll', value: 200 }
  }

  // Define 20 paylines
  const paylines: PayLine[] = [
    { positions: [1,1,1,1,1], multiplier: {} }, // Middle horizontal
    { positions: [0,0,0,0,0], multiplier: {} }, // Top horizontal
    { positions: [2,2,2,2,2], multiplier: {} }, // Bottom horizontal
    { positions: [0,1,2,1,0], multiplier: {} }, // V shape
    { positions: [2,1,0,1,2], multiplier: {} }, // Inverted V
    // ... add more paylines to reach 20
  ]

  // Initialize multipliers for each payline
  useEffect(() => {
    paylines.forEach(payline => {
      Object.keys(symbols).forEach(symbol => {
        payline.multiplier[symbol as Symbol] = symbols[symbol].value
      })
    })
  }, [])

  // Save balance to localStorage
  useEffect(() => {
    localStorage.setItem('slotsBalance', balance.toString())
  }, [balance])

  const increaseBet = () => {
    const newBet = betPerLine + 1
    if (balance >= newBet * linesPlayed) {
      setBetPerLine(newBet)
      setCurrentBet(newBet * linesPlayed)
    }
  }

  const decreaseBet = () => {
    if (betPerLine > 1) {
      const newBet = betPerLine - 1
      setBetPerLine(newBet)
      setCurrentBet(newBet * linesPlayed)
    }
  }

  const maxBet = () => {
    const maxPossibleBet = Math.floor(balance / linesPlayed)
    setBetPerLine(maxPossibleBet)
    setCurrentBet(maxPossibleBet * linesPlayed)
  }

  const tumbleReels = async (winningPositions: number[][]) => {
    setIsTumbling(true)
    
    // Remove winning symbols (replace with new ones)
    const newReels = [...reels]
    winningPositions.forEach(position => {
      const [reelIndex, rowIndex] = position
      // Shift symbols down
      for (let i = rowIndex; i > 0; i--) {
        newReels[reelIndex][i] = newReels[reelIndex][i - 1]
      }
      // Add new symbol at top
      const symbolKeys = Object.keys(symbols)
      newReels[reelIndex][0] = symbolKeys[Math.floor(Math.random() * symbolKeys.length)] as Symbol
    })
    
    setReels(newReels)
    
    // Check for new wins
    const newWins = checkWin(newReels)
    if (newWins > 0) {
      setTotalWin(prev => prev + newWins)
      await new Promise(resolve => setTimeout(resolve, 1000))
      await tumbleReels(winningPositions)
    } else {
      setIsTumbling(false)
      endSpin()
    }
  }

  const spinReels = async () => {
    if (currentBet === 0) {
      setMessage('Please place a bet first!')
      return
    }

    setIsSpinning(true)
    setTotalWin(0)
    setMessage('')

    // Simulate spinning animation
    const spinDuration = 2000
    const spinFrames = 20
    const frameDelay = spinDuration / spinFrames

    for (let i = 0; i < spinFrames; i++) {
      await new Promise(resolve => setTimeout(resolve, frameDelay))
      
      // Update each reel with random symbols
      setReels(prevReels => prevReels.map(reel => 
        reel.map(() => {
          const symbolKeys = Object.keys(symbols)
          return symbolKeys[Math.floor(Math.random() * symbolKeys.length)] as Symbol
        })
      ))
    }

    // Generate final result
    const finalReels = reels.map(reel => 
      reel.map(() => {
        const symbolKeys = Object.keys(symbols)
        return symbolKeys[Math.floor(Math.random() * symbolKeys.length)] as Symbol
      })
    )
    setReels(finalReels)

    // Check for wins and start tumbling if there are wins
    const initialWin = checkWin(finalReels)
    if (initialWin > 0) {
      setTotalWin(initialWin)
      await tumbleReels(getWinningPositions(finalReels))
    } else {
      endSpin()
    }
  }

  const getWinningPositions = (currentReels: Symbol[][]): number[][] => {
    const positions: number[][] = []
    
    paylines.forEach((payline, lineIndex) => {
      const lineSymbols = payline.positions.map((pos, reelIndex) => 
        currentReels[reelIndex][pos]
      )
      
      // Check for 3 or more matching symbols
      for (let i = 0; i < lineSymbols.length - 2; i++) {
        const symbolsMatch = lineSymbols[i] === lineSymbols[i + 1] && 
                           lineSymbols[i] === lineSymbols[i + 2]
        
        if (symbolsMatch) {
          for (let j = i; j <= i + 2; j++) {
            positions.push([j, payline.positions[j]])
          }
        }
      }
    })
    
    return positions
  }

  const checkWin = (currentReels: Symbol[][]): number => {
    let win = 0
    
    paylines.forEach((payline, lineIndex) => {
      const lineSymbols = payline.positions.map((pos, reelIndex) => 
        currentReels[reelIndex][pos]
      )
      
      // Check for 3 or more matching symbols
      for (let i = 0; i < lineSymbols.length - 2; i++) {
        if (lineSymbols[i] === lineSymbols[i + 1] && 
            lineSymbols[i] === lineSymbols[i + 2]) {
          const symbol = lineSymbols[i]
          const matchCount = lineSymbols.slice(i).filter(s => s === symbol).length
          win += calculateWin(symbol, matchCount)
          setActivePaylines(prev => [...prev, lineIndex])
          break
        }
      }
    })
    
    return win
  }

  const calculateWin = (symbol: Symbol, matchCount: number): number => {
    const baseValue = symbols[symbol].value
    let multiplier = 0
    
    switch (matchCount) {
      case 3:
        multiplier = 0.5
        break
      case 4:
        multiplier = 1
        break
      case 5:
        multiplier = 2
        break
    }
    
    return baseValue * multiplier * betPerLine
  }

  const endSpin = () => {
    setIsSpinning(false)
    if (totalWin > 0) {
      setBalance(balance + totalWin)
      setMessage(`You won $${totalWin}!`)
    } else {
      setMessage('Try again!')
    }
    setCurrentBet(0)
    setActivePaylines([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/felt-pattern.png')] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      
      <div className="relative max-w-6xl mx-auto p-4 pb-32">
        {/* Game Info Bar */}
        <div className="relative flex justify-between items-center mb-8 px-6 py-3 
                      bg-black/60 rounded-xl backdrop-blur-md border border-white/10 
                      shadow-2xl shadow-black/50">
          <div className="flex gap-12 items-center">
            <div className="text-2xl font-bold">
              <span className="text-white/70">Balance</span>
              <div className="text-3xl text-emerald-400">${balance}</div>
            </div>
            <div className="text-2xl font-bold">
              <span className="text-white/70">Current Bet</span>
              <div className="text-3xl text-yellow-400">${currentBet}</div>
            </div>
          </div>
          <Button
            onClick={() => setBalance(1000)}
            variant="outline"
            className="text-white/70 hover:text-white border-white/20 hover:border-white/40"
          >
            Reset Balance
          </Button>
          {message && (
            <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-yellow-400 animate-pulse bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">
              {message}
            </div>
          )}
        </div>

        {/* Slot Machine */}
        <div className="relative bg-black/30 rounded-2xl border border-white/10 
                      shadow-2xl p-8 backdrop-blur-sm mb-8">
          {/* Pay Table */}
          <div className="mb-8 grid grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl">
            {paylines.map((payline, index) => (
              <div key={index} className="text-white text-center">
                <span className="text-2xl">{payline.positions.join(' ')}</span>
                <div className="text-yellow-400">x{payline.multiplier[Object.keys(payline.multiplier)[0] as Symbol]}</div>
              </div>
            ))}
          </div>

          {/* Reels */}
          <div className="flex justify-center gap-4 mb-8">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className="bg-black/40 p-4 rounded-xl w-32">
                {reel.map((symbol, symbolIndex) => (
                  <div 
                    key={symbolIndex}
                    className="text-6xl text-center mb-4 last:mb-0"
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Betting Controls */}
          <div className="flex justify-center gap-4 items-center mb-4">
            <Button
              onClick={decreaseBet}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              -
            </Button>
            
            <div className="text-white text-xl">
              <div>Bet Per Line: ${(betPerLine / 100).toFixed(2)}</div>
              <div>Total Bet: ${(currentBet / 100).toFixed(2)}</div>
            </div>
            
            <Button
              onClick={increaseBet}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              +
            </Button>
            
            <Button
              onClick={maxBet}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
            >
              MAX BET
            </Button>
          </div>

          {/* Spin Button */}
          <Button
            onClick={spinReels}
            disabled={isSpinning || currentBet === 0 || balance < currentBet}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 
                     hover:from-yellow-600 hover:to-yellow-700 
                     text-black font-bold text-xl px-16 py-6 rounded-xl 
                     shadow-xl hover:shadow-yellow-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     transform hover:scale-105 transition-all duration-200"
          >
            {isSpinning ? 'Spinning...' : 'SPIN!'}
          </Button>
        </div>
      </div>
    </div>
  )
}
