'use client'
import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SubItem {
  link: string
  label: string
}

interface DropdownMenuProps {
  label: string
  subItems: SubItem[]
}

export default function DropdownMenu({ label, subItems }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center space-x-1 text-[#77D4B4] font-semibold tracking-widest hover:text-black transition-colors duration-200">
        <span className="font-bold">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="absolute top-full left-0 w-60 h-2 bg-transparent" />
          
          <div className="absolute top-full left-0 mt-11 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {subItems.map((subItem) => (
              <a
                key={subItem.link}
                href={subItem.link}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-150"
              >
                {subItem.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
