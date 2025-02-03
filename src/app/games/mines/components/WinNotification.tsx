type WinNotificationProps = {
  multiplier: number;
  amount: number;
}

export const WinNotification = ({ multiplier, amount }: WinNotificationProps) => (
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="bg-[#0F212E] border-2 border-[#00ff00] rounded-xl p-6 flex flex-col items-center gap-3 min-w-[200px]">
      <div className="text-[#00ff00] text-3xl font-bold">
        {multiplier.toFixed(2)}×
      </div>
      <div className="w-full h-[1px] bg-[#263B4D]" />
      <div className="text-[#00ff00] text-2xl">
        {amount.toFixed(2)}
      </div>
    </div>
  </div>
) 