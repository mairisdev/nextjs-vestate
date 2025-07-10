'use client'

import { Share2 } from "lucide-react"

interface ShareButtonProps {
  title: string
  excerpt: string
}

export default function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: excerpt,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Saite nokopēta!')
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="flex items-center px-4 py-2 bg-[#77D4B4] text-white rounded-lg hover:bg-[#66C5A8] transition-colors"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Dalīties
    </button>
  )
}