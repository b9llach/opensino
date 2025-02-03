interface MultiplierProps {
  value: number
}

export const Multiplier = ({ value }: MultiplierProps) => (
  <div className={`
    px-2 py-1 rounded text-center min-w-[45px] text-xs
    ${value >= 100 ? 'bg-[#FF4747]' : 
      value >= 10 ? 'bg-[#FF8B1F]' : 
      value >= 2 ? 'bg-[#F0B90B]' : 
      'bg-[#4A72FF]'}
    text-white font-medium
  `}>
    {value}x
  </div>
) 