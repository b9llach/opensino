'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, useAnimation, useDragControls } from "framer-motion"
import { useBalance } from "@/contexts/BalanceContext"

type Card = {
  suit: '♠️' | '♥️' | '♣️' | '♦️'
  value: string
  numericValue: number
  isHidden?: boolean
  animationDelay?: number
}

type GameState = 'betting' | 'playing' | 'dealerTurn' | 'gameOver'

// Add this new type for chips
type ChipValue = {
  value: number;
  color: string;
  borderColor: string;
  textColor: string;
  shadowColor?: string;
}

// Add this type for bet chips
type BetChip = {
  value: number;
  color: string;
  borderColor: string;
  textColor: string;
  id: number;
}

export default function BlackjackGame() {
    const { balance, setBalance } = useBalance()
    const [deck, setDeck] = useState<Card[]>([])
    const [playerHand, setPlayerHand] = useState<Card[]>([])
    const [dealerHand, setDealerHand] = useState<Card[]>([])
    const [gameState, setGameState] = useState<GameState>('betting')
    const [currentBet, setCurrentBet] = useState(0)
    const [message, setMessage] = useState('')
    const [betChips, setBetChips] = useState<BetChip[]>([])
    const [chipId, setChipId] = useState(0)

    const chipValues: ChipValue[] = [
      { value: 100, color: 'bg-purple-600', borderColor: 'border-purple-300', textColor: 'text-purple-100', shadowColor: 'shadow-purple-900' },
      { value: 25, color: 'bg-green-600', borderColor: 'border-green-300', textColor: 'text-green-100', shadowColor: 'shadow-green-900' },
      { value: 10, color: 'bg-red-600', borderColor: 'border-red-300', textColor: 'text-red-100', shadowColor: 'shadow-red-900' },
      { value: 5, color: 'bg-blue-600', borderColor: 'border-blue-300', textColor: 'text-blue-100', shadowColor: 'shadow-blue-900' },
      { value: 1, color: 'bg-gray-600', borderColor: 'border-gray-300', textColor: 'text-gray-100', shadowColor: 'shadow-gray-900' },
    ]

    const controls = useDragControls()
    const bettingCircleRef = useRef<HTMLDivElement>(null)

    // Initialize deck
    useEffect(() => {
      initializeDeck()
    }, [])

    const initializeDeck = () => {
      const suits: ('♠️' | '♥️' | '♣️' | '♦️')[] = ['♠️', '♥️', '♣️', '♦️']
      const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
      const newDeck: Card[] = []

      suits.forEach(suit => {
        values.forEach(value => {
          const numericValue = 
            value === 'A' ? 11 :
            ['K', 'Q', 'J'].includes(value) ? 10 :
            parseInt(value)
          newDeck.push({ suit, value, numericValue })
        })
      })

      // Shuffle deck
      setDeck([...newDeck].sort(() => Math.random() - 0.5))
    }

    const placeBet = (amount: number) => {
      if (balance >= amount) {
        setCurrentBet(currentBet + amount)
        setBalance(balance - amount)
      }
    }

    const startGame = () => {
      if (currentBet === 0) {
        setMessage('Please place a bet first!')
        return
      }

      const newDeck = [...deck]
      const playerCards = [
        { ...drawCard(newDeck), animationDelay: 0 },
        { ...drawCard(newDeck), animationDelay: 0.1 }
      ]
      const dealerCards = [
        { ...drawCard(newDeck), animationDelay: 0.2 },
        { ...drawCard(newDeck), animationDelay: 0.3, isHidden: true }
      ]
      
      setPlayerHand(playerCards)
      setDealerHand(dealerCards)
      setDeck(newDeck)
      setGameState('playing')

      // Check for blackjack
      const playerValue = calculateHandValue(playerCards)
      const dealerValue = calculateHandValue([dealerCards[0]]) // Only check visible card
      
      if (playerValue === 21) {
        // Reveal dealer's card and check for push
        dealerCards[1].isHidden = false
        setDealerHand(dealerCards)
        const fullDealerValue = calculateHandValue(dealerCards)
        
        if (fullDealerValue === 21) {
          endGame('push')
        } else {
          // Player blackjack pays 3:2
          setBalance(balance + currentBet * 2.5)
          setMessage('Blackjack! You win!')
          setGameState('gameOver')
        }
      } else if (dealerValue === 11 && dealerCards[0].value === 'A') {
        // Offer insurance here if you want to implement it
      }
    }

    const drawCard = (currentDeck: Card[]) => {
      return currentDeck.pop()!
    }

    const hit = () => {
      const newDeck = [...deck]
      const newCard = {
        ...drawCard(newDeck),
        animationDelay: playerHand.length * 0.1
      }
      const newHand = [...playerHand, newCard]
      setPlayerHand(newHand)
      setDeck(newDeck)

      if (calculateHandValue(newHand) > 21) {
        endGame('bust')
      }
    }

    const stand = () => {
      setGameState('dealerTurn')
      // Reveal dealer's hidden card first
      const revealedHand = dealerHand.map(card => ({ ...card, isHidden: false }))
      setDealerHand(revealedHand)
      setTimeout(() => playDealer(), 800) // Wait for card flip animation
    }

    const playDealer = async () => {
      let currentDealerHand = dealerHand.map(card => ({ ...card, isHidden: false }));
      const newDeck = [...deck];
      
      const dealerPlay = async () => {
        while (calculateHandValue(currentDealerHand) < 17) {
          const newCard = {
            ...drawCard(newDeck),
            animationDelay: 0,
            isHidden: false
          };
          
          currentDealerHand = [...currentDealerHand, newCard];
          setDealerHand(currentDealerHand);
          
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        setDeck(newDeck);
        const dealerValue = calculateHandValue(currentDealerHand);
        const playerValue = calculateHandValue(playerHand);

        if (dealerValue > 21) endGame('dealerBust');
        else if (playerValue > dealerValue) endGame('playerWin');
        else if (dealerValue > playerValue) endGame('dealerWin');
        else endGame('push');
      };

      dealerPlay();
    };

    const calculateHandValue = (hand: Card[]) => {
      let value = 0
      let aces = 0

      hand.forEach(card => {
        if (card.value === 'A') aces++
        value += card.numericValue
      })

      while (value > 21 && aces > 0) {
        value -= 10
        aces--
      }

      return value
    }

    const endGame = (result: 'playerWin' | 'dealerWin' | 'push' | 'bust' | 'dealerBust') => {
      setGameState('gameOver')
      
      switch (result) {
        case 'playerWin':
          setBalance(balance + currentBet * 2)
          setMessage('You win!')
          break
        case 'dealerWin':
          setMessage('Dealer wins!')
          break
        case 'push':
          setBalance(balance + currentBet)
          setMessage('Push!')
          break
        case 'bust':
          setMessage('Bust! You lose!')
          break
        case 'dealerBust':
          setBalance(balance + currentBet * 2)
          setMessage('Dealer busts! You win!')
          break
      }
    }

    const resetGame = () => {
      setPlayerHand([])
      setDealerHand([])
      setCurrentBet(0)
      setBetChips([]) // Clear bet chips
      setGameState('betting')
      setMessage('')
      initializeDeck()
    } 

    const handleChipInteraction = (chip: ChipValue) => {
      if (balance >= chip.value) {
        setBalance(balance - chip.value)
        setCurrentBet(currentBet + chip.value)
        setBetChips([...betChips, { ...chip, id: chipId }])
        setChipId(chipId + 1)
      }
    }

    const handleDragEnd = (chip: ChipValue, event: any) => {
      const bettingCircle = bettingCircleRef.current
      if (bettingCircle) {
        const rect = bettingCircle.getBoundingClientRect()
        const { clientX, clientY } = event
        
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom &&
          balance >= chip.value
        ) {
          handleChipInteraction(chip)
        }
      }
    }

    const double = () => {
      if (balance >= currentBet) {
        const newDeck = [...deck]
        const newCard = {
          ...drawCard(newDeck),
          animationDelay: playerHand.length * 0.1
        }
        const newHand = [...playerHand, newCard]
        
        // Double the bet and update chips
        setBalance(balance - currentBet)
        setCurrentBet(currentBet * 2)
        setBetChips([...betChips, ...betChips]) // Double the bet chips visually
        
        // Deal one card and stand
        setPlayerHand(newHand)
        setDeck(newDeck)
        
        if (calculateHandValue(newHand) > 21) {
          endGame('bust')
        } else {
          setGameState('dealerTurn')
          // Reveal dealer's hidden card first
          const revealedHand = dealerHand.map(card => ({ ...card, isHidden: false }))
          setDealerHand(revealedHand)
          setTimeout(() => playDealer(), 800)
        }
      }
    }

    const clearBet = () => {
      setBalance(balance + currentBet)
      setCurrentBet(0)
      setBetChips([])
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-[url('/felt-pattern.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
        
        <div className="relative max-w-6xl mx-auto p-4">
          {/* Dealer Area */}
          <div className="relative mb-8 text-center">
            <h2 className="text-xl font-bold text-white/90 mb-2 flex items-center justify-center gap-2">
              <span className="text-white/50">⎯</span>
              Dealer's Hand
              <span className="text-white/50">⎯</span>
            </h2>
            {gameState !== 'betting' && (
              <div className="text-white/90 text-lg mb-4">
                Score: {calculateHandValue(dealerHand.filter(card => !card.isHidden))}
              </div>
            )}
            <div className="flex justify-center gap-2 min-h-[140px]">
              {dealerHand.map((card, index) => (
                <div 
                  key={index}
                  className="relative transform hover:translate-y-[-5px] transition-transform duration-300"
                  style={{
                    marginLeft: index > 0 ? '-1.5rem' : '0',
                    animation: `dealCard 0.3s ease-out forwards`,
                    animationDelay: `${card.animationDelay}s`,
                    opacity: 0,
                  }}
                >
                  <div className={`w-24 h-36 rounded-xl shadow-2xl ${card.isHidden ? 'bg-red-600' : 'bg-white'} 
                    ${!card.isHidden && 'ring-1 ring-white/20'}`}>
                    {!card.isHidden ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <div className={`text-5xl font-bold mb-2 ${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}`}>
                          {card.value}
                        </div>
                        <div className={`text-7xl ${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}`}>
                          {card.suit}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 rounded-xl">
                        <div className="text-6xl opacity-50">🎴</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Area */}
          <div className="relative text-center mt-8">
            <h2 className="text-xl font-bold text-white/90 mb-2 flex items-center justify-center gap-2">
              <span className="text-white/50">⎯</span>
              Your Hand
              <span className="text-white/50">⎯</span>
            </h2>
            {gameState !== 'betting' && (
              <div className="text-white/90 text-lg mb-4">
                Score: {calculateHandValue(playerHand)}
              </div>
            )}
            <div className="flex justify-center gap-2 min-h-[140px]">
              {playerHand.map((card, index) => (
                <div 
                  key={index}
                  className="relative transform hover:translate-y-[-5px] transition-transform duration-300"
                  style={{
                    marginLeft: index > 0 ? '-1.5rem' : '0',
                    animation: `dealCard 0.3s ease-out forwards`,
                    animationDelay: `${card.animationDelay}s`,
                    opacity: 0,
                  }}
                >
                  <div className={`w-24 h-36 rounded-xl shadow-2xl ${card.isHidden ? 'bg-red-600' : 'bg-white'} 
                    ${!card.isHidden && 'ring-1 ring-white/20'}`}>
                    {!card.isHidden ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <div className={`text-5xl font-bold mb-2 ${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}`}>
                          {card.value}
                        </div>
                        <div className={`text-7xl ${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}`}>
                          {card.suit}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 rounded-xl">
                        <div className="text-6xl opacity-50">🎴</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Game Controls */}
            {gameState === 'playing' && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="flex justify-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                  <Button 
                    onClick={hit}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 
                             text-white font-bold text-lg px-12 py-6 rounded-xl shadow-lg shadow-emerald-900/30
                             transform hover:scale-105 transition-all duration-200 min-w-[140px]"
                  >
                    Hit
                  </Button>
                  <Button 
                    onClick={stand}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                             text-white font-bold text-lg px-12 py-6 rounded-xl shadow-lg shadow-red-900/30
                             transform hover:scale-105 transition-all duration-200 min-w-[140px]"
                  >
                    Stand
                  </Button>
                  <Button 
                    onClick={double}
                    disabled={balance < currentBet || playerHand.length > 2}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                             text-white font-bold text-lg px-12 py-6 rounded-xl shadow-lg shadow-purple-900/30
                             disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 
                             transition-all duration-200 min-w-[140px]"
                  >
                    Double
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Betting Area */}
          {gameState === 'betting' && (
            <div className="fixed bottom-6 left-0 right-0 px-4">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Betting Circle */}
                <div 
                  ref={bettingCircleRef}
                  className="relative mx-auto w-48 h-48 rounded-full 
                            border-4 border-white/30 bg-black/40 
                            backdrop-blur-md flex items-center justify-center
                            shadow-2xl"
                >
                  {betChips.length > 0 ? (
                    <div className="relative w-full h-full">
                      {/* Stacked chips */}
                      {betChips.map((chip, index) => (
                        <div
                          key={chip.id}
                          className={`absolute left-1/2 -translate-x-1/2
                                    ${chip.color} w-28 h-28 rounded-full
                                    flex items-center justify-center
                                    shadow-lg border-4 ${chip.borderColor}
                                    transform transition-all duration-200`}
                          style={{
                            bottom: `${index * 8}px`,
                            zIndex: index,
                          }}
                        >
                          <div className={`relative text-center ${chip.textColor}`}>
                            <span className="text-lg font-light">$</span>
                            <span className="text-3xl font-bold">{chip.value}</span>
                          </div>
                          <div className="absolute inset-4 rounded-full border-2 border-white/20" />
                          <div className="absolute inset-8 rounded-full border border-white/10" />
                        </div>
                      ))}
                      {/* Total bet amount */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 
                                    text-2xl font-bold text-white bg-black/50 
                                    px-4 py-1 rounded-full backdrop-blur-sm">
                        ${currentBet}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl text-white/50 text-center font-light">
                      Drag Chips Here
                    </div>
                  )}
                </div>

                {/* Chips Rack */}
                <div className="flex justify-center gap-4 items-center 
                              bg-black/40 backdrop-blur-md rounded-xl p-4 
                              border border-white/10 shadow-2xl">
                  {chipValues.map((chip) => (
                    <motion.div
                      key={chip.value}
                      drag
                      dragControls={controls}
                      whileDrag={{ scale: 1.1, zIndex: 50 }}
                      dragSnapToOrigin
                      onDragEnd={(event) => handleDragEnd(chip, event)}
                      onClick={() => balance >= chip.value && handleChipInteraction(chip)}
                      className={`
                        ${chip.color} w-20 h-20 rounded-full
                        flex items-center justify-center 
                        ${balance >= chip.value ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                        shadow-lg border-4 ${chip.borderColor}
                        relative group transform transition-all duration-200
                        hover:shadow-2xl ${balance >= chip.value && 'hover:-translate-y-2'}
                      `}
                    >
                      <div className={`relative text-center ${chip.textColor}`}>
                        <span className="text-lg font-light">$</span>
                        <span className="text-3xl font-bold">{chip.value}</span>
                      </div>
                      <div className="absolute inset-4 rounded-full border-2 border-white/20" />
                      <div className="absolute inset-8 rounded-full border border-white/10" />
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={clearBet}
                    className="bg-red-500/20 hover:bg-red-500/30 text-white 
                             border-red-500/50 text-lg px-10 py-6 rounded-xl"
                  >
                    Clear Bet
                  </Button>
                  <Button 
                    onClick={startGame} 
                    disabled={currentBet === 0}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 
                             hover:from-yellow-600 hover:to-yellow-700 
                             text-black font-bold text-xl px-16 py-6 rounded-xl 
                             shadow-xl hover:shadow-yellow-500/20
                             disabled:opacity-50 disabled:cursor-not-allowed 
                             transform hover:scale-105 transition-all duration-200"
                  >
                    Deal Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Play Again Button */}
          {gameState === 'gameOver' && (
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex justify-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                <Button 
                  onClick={resetGame}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                           text-white font-bold text-xl px-20 py-8 rounded-xl shadow-lg shadow-blue-900/30
                           transform hover:scale-105 transition-all duration-200"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
