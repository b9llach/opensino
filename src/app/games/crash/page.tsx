'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { useBalance } from "@/contexts/BalanceContext"
import { WinNotification } from './components/WinNotification'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

const styles = `
  @keyframes reveal {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`

export default function CrashGame() {
  const { balance, setBalance } = useBalance()
  const [currentBet, setCurrentBet] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [multiplier, setMultiplier] = useState(1)
  const [crashPoint, setCrashPoint] = useState(1)
  const [gameHistory, setGameHistory] = useState<number[]>([])
  const [showWinNotification, setShowWinNotification] = useState(false)
  const [netProfit, setNetProfit] = useState(0)
  const [autoCashoutAt, setAutoCashoutAt] = useState(2)
  const gameLoopRef = useRef<number | null>(null)
  const [chartData, setChartData] = useState<{x: number, y: number}[]>([])
  const lastTimestamp = useRef<number>(0)
  const startTime = useRef<number>(0)

  // Sound effects
  const clickSound = typeof Audio !== 'undefined' ? new Audio('/click.mp3') : null
  const winSound = typeof Audio !== 'undefined' ? new Audio('/win.mp3') : null
  const loseSound = typeof Audio !== 'undefined' ? new Audio('/fail.mp3') : null

  const generateCrashPoint = () => {
    // This uses a house edge of approximately 4%
    const e = 0.04 // house edge
    const r = Math.random() // random number between 0 and 1
    return Math.max(1.00, (1 / (1 - r)) * (1 - e))
  }

  const startGame = () => {
    if (currentBet <= 0 || currentBet > balance) return
    
    setBalance(balance - currentBet)
    setIsPlaying(true)
    setCrashPoint(generateCrashPoint())
    setMultiplier(1)
    setChartData([{ x: 0, y: 1 }])
    startTime.current = Date.now()
    lastTimestamp.current = Date.now()
    
    gameLoop()
  }

  const gameLoop = () => {
    const now = Date.now()
    const elapsed = (now - startTime.current) / 1000
    const deltaTime = (now - lastTimestamp.current) / 1000
    lastTimestamp.current = now

    const newMultiplier = Math.pow(1.06, elapsed)
    setMultiplier(newMultiplier)
    setChartData(prev => [...prev, { x: elapsed, y: newMultiplier }])

    // Check if game should end
    if (newMultiplier >= crashPoint) {
      endGame(false)
      return
    }

    // Cashout check for both auto and manual modes
    if (autoCashoutAt > 1 && newMultiplier >= autoCashoutAt) {
      cashOut()
      return
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  const cashOut = () => {
    if (!isPlaying) return

    // Play win sound
    winSound?.play().catch(console.error)

    const winAmount = currentBet * multiplier
    const profit = winAmount - currentBet
    
    setBalance(balance + winAmount)
    setNetProfit(profit)
    setShowWinNotification(true)
    
    setTimeout(() => {
      setShowWinNotification(false)
    }, 2000)

    endGame(true)
  }

  const endGame = (cashedOut: boolean) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }

    if (!cashedOut) {
      // Play lose sound
      loseSound?.play().catch(console.error)
    }

    setIsPlaying(false)
    setGameHistory(prev => [multiplier, ...prev].slice(0, 10))
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        type: 'linear' as const,
        display: false,
      },
      y: {
        type: 'linear' as const,
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(tickValue: number | string) {
            return typeof tickValue === 'number' ? tickValue.toFixed(2) + 'x' : tickValue
          },
          maxTicksLimit: 6,
        },
        min: 1,
        max: Math.max(5, multiplier * 1.2), // Dynamic max based on current multiplier
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      line: {
        borderWidth: 3,
        borderColor: '#4CAF50',
        tension: 0.1,
      },
      point: {
        radius: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const,
    },
  }

  const chartDataConfig = {
    datasets: [
      {
        data: chartData,
        borderColor: isPlaying ? '#4CAF50' : '#FF4444',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.1,
        fill: {
          target: 'origin',
          above: isPlaying ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)',
        },
      },
    ],
  }

  return (
    <div className="p-6">
      <style>{styles}</style>
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
                onClick={() => setCurrentBet(prev => Math.max(0, prev / 2))}
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

          {/* Cashout At Setting */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Cashout At</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0F212E] rounded-lg flex items-center px-3 h-12 border border-[#263B4D] focus-within:border-[#3E5770]">
                <input
                  type="text"
                  inputMode="decimal"
                  value={autoCashoutAt === 0 ? '' : autoCashoutAt}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow digits, one decimal point, and prevent multiple dots
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      if (value === '') {
                        setAutoCashoutAt(0);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setAutoCashoutAt(numValue);
                        }
                      }
                    }
                  }}
                  className="bg-transparent text-white w-full outline-none"
                  placeholder="0.00"
                />
                <span className="text-gray-400">×</span>
              </div>
              <button 
                onClick={() => setAutoCashoutAt(prev => Math.max(1.01, parseFloat((prev / 2).toFixed(2))))}
                className="bg-[#0F212E] text-white h-12 px-4 rounded-lg hover:bg-[#162736] border border-[#263B4D] font-medium transition-colors"
              >
                ½
              </button>
              <button 
                onClick={() => setAutoCashoutAt(prev => parseFloat((prev * 2).toFixed(2)))}
                className="bg-[#0F212E] text-white h-12 px-4 rounded-lg hover:bg-[#162736] border border-[#263B4D] font-medium transition-colors"
              >
                2×
              </button>
            </div>
          </div>

          {/* Total Net Gain Display */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">
              Total Net Gain ({multiplier.toFixed(2)}×)
            </label>
            <div className="bg-[#0F212E] rounded-lg flex items-center px-3 h-12 border border-[#263B4D]">
              <span className="text-white font-medium">
                ${(currentBet * multiplier - currentBet).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {!isPlaying ? (
            <button
              onClick={startGame}
              disabled={currentBet <= 0 || currentBet > balance}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-medium h-12 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Bet
            </button>
          ) : (
            <button
              onClick={cashOut}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-medium h-12 rounded-lg transition-colors"
            >
              Cashout {multiplier.toFixed(2)}×
            </button>
          )}
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-[#1A2C38] rounded-lg p-4">
          <div className="h-full flex flex-col">
            {/* Multiplier Display */}
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold ${isPlaying ? 'text-[#4CAF50]' : 'text-white'}`}>
                {multiplier.toFixed(2)}×
              </div>
            </div>

            {/* Graph Area with centered notification */}
            <div className="flex-1 relative h-[300px] bg-[#0F212E] rounded-lg p-4">
              <Line options={chartOptions} data={chartDataConfig} />
              {showWinNotification && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <WinNotification 
                    multiplier={multiplier}
                    amount={netProfit}
                  />
                </div>
              )}
            </div>

            {/* Game History */}
            <div className="flex gap-2 mt-4 overflow-x-auto py-2">
              {gameHistory.map((point, index) => (
                <div
                  key={index}
                  className={`
                    px-3 py-1 rounded text-sm font-medium min-w-[80px] text-center
                    ${point >= 2 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                    }
                  `}
                >
                  {point.toFixed(2)}×
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
