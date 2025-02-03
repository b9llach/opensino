'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type BalanceContextType = {
  balance: number
  setBalance: (balance: number) => void
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(1000) // Default value
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedBalance = localStorage.getItem('balance')
    if (savedBalance) {
      setBalance(parseInt(savedBalance))
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('balance', balance.toString())
    }
  }, [balance, isClient])

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalance() {
  const context = useContext(BalanceContext)
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
} 