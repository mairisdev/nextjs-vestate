'use client'

import { useEffect } from 'react'

export function TrackPropertyView({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    fetch('/api/increment-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
  }, [propertyId])

  return null
}