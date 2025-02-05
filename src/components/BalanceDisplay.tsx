'use client'

import { useBalance } from "@/contexts/BalanceContext"
import { useState } from "react"

export const BalanceDisplay = () => {
  const { balance, setBalance } = useBalance()
  const [copied, setCopied] = useState(false)

  const handleOpenSinoClick = () => {
    if (balance < 1000) {
      setBalance(1000);
    }
  };

  const handleCopyContractAddress = () => {
    const contractAddress = "ZivJeHuu5aLGgXMKeMv2g4vWTwPRWdr5KwrLsuxpump";
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="flex text-sm">

      <div className="bg-[#1A2C38] rounded-l-lg px-4 py-2 flex items-center">
        <span className="text-white font-medium">${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
      </div>
      <button 
        onClick={handleOpenSinoClick}
        className="bg-[#4A72FF] hover:bg-[#3A62FF] text-white px-4 py-2 transition-colors font-medium border-[#2A52FF]"
      >
        Add Balance
      </button> 
      <button 
        onClick={handleCopyContractAddress}
        className="bg-[#4A72FF] hover:bg-[#3A62FF] text-white px-4 py-2 rounded-r-lg transition-colors font-medium border-l border-[#2A52FF]"
      >
        {copied ? 'Copied!' : 'ZivJeHuu5aLGgXMKeMv2g4vWTwPRWdr5KwrLsuxpump'}
      </button> 

      
    </div>

  );
}; 