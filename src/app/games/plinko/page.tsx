'use client'

import { useState, useEffect, useRef } from 'react'
import { BalanceDisplay } from "@/components/BalanceDisplay"
import { Pin } from './components/Pin'
import { Multiplier } from './components/Multiplier'
import { WinNotification } from './components/WinNotification'

const MULTIPLIERS = {
  low: [1.1, 1.2, 1.4, 1.6, 2, 3, 5, 10, 5, 3, 2, 1.6, 1.4, 1.2, 1.1],
  medium: [1.3, 1.5, 1.8, 2.2, 3, 5, 10, 20, 10, 5, 3, 2.2, 1.8, 1.5, 1.3],
  high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
}

interface Ball {
  id: number
  position: { x: number, y: number }
  direction: number // -1 for left, 1 for right
}

export default function PlinkoGame() {
  const [balance, setBalance] = useState(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedBalance = localStorage.getItem('plinkoBalance')
      return savedBalance ? parseInt(savedBalance) : 1000
    }
    return 1000 // Default value for server-side rendering
  })
  const [currentBet, setCurrentBet] = useState(0)
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('high')
  const [rows, setRows] = useState(16)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [balls, setBalls] = useState<Ball[]>([])
  const [showWinNotification, setShowWinNotification] = useState(false)
  const [lastWin, setLastWin] = useState(0)
  const [lastMultiplier, setLastMultiplier] = useState(0)
  const gameLoopRef = useRef<number | null>(null)
  const lastDropTime = useRef<number>(0)

  // Save balance to localStorage
  useEffect(() => {
    localStorage.setItem('plinkoBalance', balance.toString())
  }, [balance])

  const generatePinPositions = () => {
    const positions = []
    const boardWidth = 600 // Reduced board width
    const spacing = 28    // Reduced spacing
    
    for (let row = 0; row < rows; row++) {
      const pinsInRow = row + 3
      const rowWidth = (pinsInRow - 1) * spacing
      const startX = (boardWidth - rowWidth) / 2
      const y = 40 + (row * spacing)
      
      for (let pin = 0; pin < pinsInRow; pin++) {
        const x = startX + (pin * spacing)
        positions.push({ x, y })
      }
    }
    return positions
  }

  const dropBall = () => {
    if (currentBet <= 0 || currentBet > balance || isPlaying) return
    
    setBalance(prev => prev - currentBet)
    setIsPlaying(true)

    const newBall: Ball = {
      id: Date.now(),
      position: { x: window.innerWidth / 2, y: 0 },
      direction: 0
    }

    setBalls(prev => [...prev, newBall])
    startGameLoop()
  }

  const startGameLoop = () => {
    if (gameLoopRef.current) return

    const updateBall = (ball: Ball) => {
      // Simple physics simulation
      ball.position.y += 5
      if (ball.direction) {
        ball.position.x += ball.direction * 3
      }

      // Check for pin collisions
      const pinPositions = generatePinPositions()
      for (const pin of pinPositions) {
        const dx = ball.position.x - pin.x
        const dy = ball.position.y - pin.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 10) { // Collision radius
          ball.direction = Math.random() > 0.5 ? 1 : -1
        }
      }

      // Check if ball reached bottom
      if (ball.position.y > window.innerHeight - 100) {
        const multiplierIndex = Math.floor((ball.position.x / window.innerWidth) * MULTIPLIERS[riskLevel].length)
        const multiplier = MULTIPLIERS[riskLevel][multiplierIndex]
        const win = currentBet * multiplier

        setLastWin(win)
        setLastMultiplier(multiplier)
        setShowWinNotification(true)
        setBalance(prev => prev + win)
        setIsPlaying(false)
        setBalls(prev => prev.filter(b => b.id !== ball.id))

        setTimeout(() => {
          setShowWinNotification(false)
        }, 2000)
      }
    }

    const gameLoop = () => {
      setBalls(prev => {
        const updatedBalls = prev.map(ball => {
          const newBall = { ...ball }
          updateBall(newBall)
          return newBall
        })
        return updatedBalls
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  return (
    <div className="h-screen bg-[#0F212E] p-6">
      {/* Balance Display */}
      <div className="max-w-[900px] mx-auto mb-4 flex justify-center items-center">
        <BalanceDisplay balance={balance} setBalance={setBalance} />
      </div>

      <div className="max-w-[900px] mx-auto flex gap-6">
        {/* Left Panel */}
        <div className="w-[280px] bg-[#1A2C38] rounded-lg p-4">
          {/* Manual/Auto Toggle */}
          <div className="bg-[#0F212E] rounded-full p-1 flex mb-6">
            <button 
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${!autoMode ? 'bg-[#1A2C38] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]' : 'text-gray-400'}`}
              onClick={() => setAutoMode(false)}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${autoMode ? 'bg-[#1A2C38] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]' : 'text-gray-400'}`}
              onClick={() => setAutoMode(true)}
            >
              Auto
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Amount</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0F212E] rounded-lg flex items-center px-3 h-12 border border-[#263B4D] focus-within:border-[#3E5770]">
                <input
                  type="text"
                  value={currentBet === 0 ? '' : currentBet.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setCurrentBet(0);
                      return;
                    }
                    if (/^\d*\.?\d*$/.test(value)) {
                      setCurrentBet(Number(value));
                    }
                  }}
                  className="bg-transparent text-white w-full outline-none"
                  placeholder="0.00"
                />
              </div>
              <button 
                onClick={() => setCurrentBet(prev => prev / 2)}
                className="bg-[#0F212E] text-white h-12 px-4 rounded-lg hover:bg-[#162736] border border-[#263B4D] font-medium transition-colors"
              >
                ½
              </button>
              <button 
                onClick={() => setCurrentBet(prev => prev * 2)}
                className="bg-[#0F212E] text-white h-12 px-4 rounded-lg hover:bg-[#162736] border border-[#263B4D] font-medium transition-colors"
              >
                2×
              </button>
            </div>
          </div>

          {/* Risk Level Selection */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Risk</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full bg-[#0F212E] text-white h-12 px-3 rounded-lg border border-[#263B4D] focus:border-[#3E5770] outline-none appearance-none cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Rows Selection */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Rows</label>
            <select
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full bg-[#0F212E] text-white h-12 px-3 rounded-lg border border-[#263B4D] focus:border-[#3E5770] outline-none appearance-none cursor-pointer"
            >
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
            </select>
          </div>

          {/* Play Button */}
          <button
            onClick={dropBall}
            className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-medium h-12 rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Play
          </button>
        </div>

        {/* Game Board */}
        <div className="flex-1 bg-[#1A2C38] rounded-lg p-4">
          <div className="w-[600px] h-[500px] mx-auto bg-[#0F212E] rounded-lg relative overflow-hidden">
            {/* Pins */}
            <div className="absolute inset-0">
              {generatePinPositions().map((pos, i) => (
                <div key={i} style={{ position: 'absolute', left: pos.x, top: pos.y }}>
                  <Pin />
                </div>
              ))}
            </div>

            {/* Balls */}
            {balls.map(ball => (
              <div
                key={ball.id}
                className="w-4 h-4 bg-[#00FF00] rounded-full absolute"
                style={{
                  left: ball.position.x,
                  top: ball.position.y,
                  transition: 'all 0.05s linear'
                }}
              />
            ))}

            {/* Multipliers */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center px-4 py-2 bg-[#0A1924]">
              <div className="w-[580px] flex justify-between"> {/* Adjusted width */}
                {MULTIPLIERS[riskLevel].map((value, i) => (
                  <Multiplier key={i} value={value} />
                ))}
              </div>
            </div>

            {/* Win Notification */}
            {showWinNotification && (
              <WinNotification
                multiplier={lastMultiplier}
                amount={lastWin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
