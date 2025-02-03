'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { GemIcon } from './components/GemIcon'
import { MineIcon } from './components/MineIcon'
import { WinNotification } from './components/WinNotification'
import { BalanceDisplay } from "@/components/BalanceDisplay"

// Add this keyframes definition
const styles = `
  @keyframes reveal {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`

type Cell = {
  isMine: boolean
  isRevealed: boolean
}

// Add this helper function at the top of your file
const formatBalance = (num: number) => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default function MinesGame() {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('balance')
    return savedBalance ? parseInt(savedBalance) : 1000
  })
  const [currentBet, setCurrentBet] = useState(0)
  const [mineCount, setMineCount] = useState(3)
  const [isPlaying, setIsPlaying] = useState(false)
  const [cells, setCells] = useState<Cell[]>(Array(25).fill({ isMine: false, isRevealed: false }))
  const [gameOver, setGameOver] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [message, setMessage] = useState('')
  const [potentialWin, setPotentialWin] = useState(0)
  const [showWinNotification, setShowWinNotification] = useState(false)
  const [winMultiplier, setWinMultiplier] = useState(0)
  const [netProfit, setNetProfit] = useState(0)

  // Add these refs for audio elements
  const clickSound = typeof Audio !== 'undefined' ? new Audio('/click.mp3') : null
  const winSound = typeof Audio !== 'undefined' ? new Audio('/win.mp3') : null
  const loseSound = typeof Audio !== 'undefined' ? new Audio('/fail.mp3') : null

  // Save balance to localStorage
  useEffect(() => {
    localStorage.setItem('balance', balance.toString())
  }, [balance])

  const initializeGame = () => {
    if (currentBet <= 0) {
      setMessage('Please enter a bet amount')
      return
    }
    if (currentBet > balance) {
      setMessage('Insufficient balance')
      return
    }

    // Reset potential win
    setPotentialWin(0)
    
    // Deduct bet from balance
    setBalance(prev => prev - currentBet)
    
    // Create new board
    const newCells: Cell[] = Array(25).fill(null).map(() => ({
      isMine: false,
      isRevealed: false
    }))

    // Place mines randomly
    let minesToPlace = mineCount
    while (minesToPlace > 0) {
      const randomIndex = Math.floor(Math.random() * 25)
      if (!newCells[randomIndex].isMine) {
        newCells[randomIndex].isMine = true
        minesToPlace--
      }
    }

    setCells(newCells)
    setIsPlaying(true)
    setGameOver(false)
    setMessage('')
  }

  const revealCell = (index: number) => {
    if (!isPlaying || cells[index].isRevealed) return

    const newCells = [...cells]
    newCells[index].isRevealed = true
    setCells(newCells)

    if (newCells[index].isMine) {
      // Play lose sound when hitting a mine
      loseSound?.play().catch(console.error)
      
      // Hit a mine - game over
      setGameOver(true)
      setIsPlaying(false)
      setMessage('Game Over!')
      setPotentialWin(0)
      revealAllMines()
    } else {
      // Play click sound when revealing a gem
      clickSound?.play().catch(console.error)
      
      // Safe cell - calculate potential win
      const revealedCount = newCells.filter(cell => cell.isRevealed && !cell.isMine).length
      const multiplier = calculateMultiplier(revealedCount, mineCount)
      const winAmount = Math.floor(currentBet * multiplier)
      setPotentialWin(winAmount)
      setMessage(`Next: ${winAmount}`)

      // Check if all safe cells are revealed (auto-cashout)
      const safeCells = 25 - mineCount
      if (revealedCount === safeCells) {
        cashOut()
      }
    }
  }

  const calculateMultiplier = (revealed: number, mines: number) => {
    // Stakes uses this formula for their multipliers
    // Probability-based calculation
    const totalTiles = 25
    const safeTiles = totalTiles - mines
    let probability = 1

    // Calculate probability of winning based on revealed tiles
    for (let i = 0; i < revealed; i++) {
      probability *= (safeTiles - i) / (totalTiles - i)
    }

    // Add house edge (approximately 4%)
    const houseEdge = 0.96
    return (1 / probability) * houseEdge
  }

  const revealAllMines = () => {
    const newCells = cells.map(cell => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed
    }))
    setCells(newCells)
  }

  const cashOut = () => {
    // Play win sound when cashing out
    winSound?.play().catch(console.error)
    
    setIsPlaying(false)
    setGameOver(true)
    setMessage('Cashed Out!')
    
    // Calculate win amount (this is the total you'll receive)
    const revealedCount = cells.filter(cell => cell.isRevealed && !cell.isMine).length
    const multiplier = calculateMultiplier(revealedCount, mineCount)
    const totalWin = currentBet * multiplier
    const profit = totalWin - currentBet
    
    // Set the net profit for the notification
    setNetProfit(profit)
    
    // Show win notification
    setWinMultiplier(multiplier)
    setShowWinNotification(true)
    
    // Hide notification after 2 seconds
    setTimeout(() => {
      setShowWinNotification(false)
    }, 2000)
    
    // Add winnings to balance
    setBalance(prev => prev + totalWin)
    setPotentialWin(0)
  }

  return (
    <div className="h-screen bg-[#0F212E] p-6">
      <style>{styles}</style>
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

          {/* Mines Selection */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">Mines</label>
            <select
              value={mineCount}
              onChange={(e) => setMineCount(Number(e.target.value))}
              className="w-full bg-[#0F212E] text-white h-12 px-3 rounded-lg border border-[#263B4D] focus:border-[#3E5770] outline-none appearance-none cursor-pointer"
            >
              {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Mines and Gems Display */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Mines</label>
              <div className="bg-[#0F212E] rounded-lg flex items-center px-3 h-12 border border-[#263B4D]">
                <span className="text-white font-medium">{mineCount}</span>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Gems</label>
              <div className="bg-[#0F212E] rounded-lg flex items-center px-3 h-12 border border-[#263B4D]">
                <span className="text-white font-medium">{25 - mineCount}</span>
              </div>
            </div>
          </div>

          {/* Total net gain Display */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">
              Total net gain ({calculateMultiplier(cells.filter(cell => cell.isRevealed && !cell.isMine).length, mineCount).toFixed(2)}×)
            </label>
            <div className="bg-[#0F212E] rounded-lg flex items-center px-3 h-12 border border-[#263B4D]">
              <span className="text-white font-medium">{potentialWin.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isPlaying ? (
            <button
              onClick={initializeGame}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-medium h-12 rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Play
            </button>
          ) : (
            <button
              onClick={cashOut}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-medium h-12 rounded-lg transition-colors"
            >
              Cash Out
            </button>
          )}
        </div>

        {/* Game Grid */}
        <div className="flex-1">
          <div className="relative grid grid-cols-5 gap-3">
            {showWinNotification && (
              <WinNotification 
                multiplier={winMultiplier}
                amount={netProfit}
              />
            )}
            {cells.map((cell, index) => (
              <button
                key={index}
                onClick={() => revealCell(index)}
                disabled={!isPlaying || cell.isRevealed}
                className={`
                  aspect-square rounded-lg transition-all duration-200 ${
                    cell.isRevealed
                      ? cell.isMine
                        ? 'bg-transparent scale-[0.95]'
                        : 'bg-transparent scale-[0.95]'
                      : 'bg-[#1A2C38] hover:bg-[#243845] active:scale-[0.95]'
                  }
                  disabled:cursor-not-allowed
                  shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_8px_rgba(0,0,0,0.2)]
                  relative
                  min-h-[80px]
                `}
              >
                {cell.isRevealed && (
                  <div className={`
                    absolute inset-0 flex items-center justify-center
                    animate-[reveal_0.3s_ease-out]
                    scale-[1.5]
                  `}>
                    {cell.isMine ? <MineIcon /> : <GemIcon />}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
