'use client'

const formatBalance = (num: number) => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

interface BalanceDisplayProps {
  balance: number;
  setBalance: (balance: number) => void;
}

export const BalanceDisplay = ({ balance, setBalance }: BalanceDisplayProps) => {
  const handleOpenSinoClick = () => {
    if (balance < 1000) {
      setBalance(1000);
    }
  };

  return (
    <div className="flex text-sm">
      <div className="bg-[#1A2C38] rounded-l-lg px-4 py-2 flex items-center">
        <span className="text-white font-medium">${formatBalance(balance)}</span>
      </div>
      <button 
        onClick={handleOpenSinoClick}
        className="bg-[#4A72FF] hover:bg-[#3A62FF] text-white px-4 py-2 rounded-r-lg transition-colors font-medium border-l border-[#2A52FF]"
      >
        OpenSino
      </button>
    </div>
  );
}; 