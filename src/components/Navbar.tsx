'use client'

import Link from 'next/link'
import { Icons } from './icons'
import { usePathname } from 'next/navigation'

export const Navbar = () => {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-[#1A2730] h-screen flex flex-col border-r border-[#243441]">
      {/* OpenShitStakeButton */}
      <div className="p-4">
        <button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-lg px-4 py-2.5 font-medium text-lg tracking-wide">
          ShitStake
        </button>
      </div>

      {/* Quick Access */}
      {/* <div className="px-4 space-y-1">
        <NavItem href="/favourites" icon={<Icons.Star />} label="Favourites" active={pathname === '/favourites'} />
        <NavItem href="/recent" icon={<Icons.Clock />} label="Recent" active={pathname === '/recent'} />
        <NavItem href="/challenges" icon={<Icons.Target />} label="Challenges" active={pathname === '/challenges'} />
        <NavItem href="/gameplay" icon={<Icons.Gamepad />} label="My Game Play" active={pathname === '/gameplay'} />
      </div> */}

      {/* Games Section */}
      <div className="px-4 mt-6">
        <div className="text-white text-lg mb-2">Games</div>
        <div className="space-y-1">
          <NavItem href="/games" icon={<Icons.Fire />} label="ShitStake Originals" active={pathname === '/games'} />
        </div>
      </div>
    </div>
  )
}

const NavItem = ({ 
  href, 
  icon, 
  label, 
  active = false,
  hasArrow = false 
}: { 
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  hasArrow?: boolean
}) => (
  <Link 
    href={href} 
    className={`flex items-center px-3 py-2 rounded-lg text-[15px] ${
      active 
        ? 'bg-[#243441] text-white' 
        : 'text-zinc-300 hover:text-white hover:bg-[#243441]'
    } transition-colors`}
  >
    <span className={`mr-3 ${active ? 'text-white' : 'text-zinc-400'}`}>{icon}</span>
    <span className="flex-1">{label}</span>
    {hasArrow && (
      <span className="text-zinc-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </span>
    )}
  </Link>
)