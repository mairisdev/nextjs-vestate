'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export function ViewCounter({ propertyId }: { propertyId: string }) {
  const [viewCount, setViewCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/view-count?propertyId=${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setViewCount(data.count)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch view count:', err)
      })
  }, [propertyId])

  return (
    <div className="flex items-center space-x-1">
      <Eye className="w-4 h-4" />
      <span>
        {viewCount !== null ? viewCount : '–'} unikāli skatījumi
      </span>
    </div>
  )
}