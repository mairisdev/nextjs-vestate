'use client'

import { useEffect } from 'react'

export function useTrackView(propertyId: string) {
  useEffect(() => {
    if (!propertyId) return
    fetch('/api/increment-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propertyId }),
    }).catch((err) => {
      console.error('Failed to track property view:', err)
    })
  }, [propertyId])
}