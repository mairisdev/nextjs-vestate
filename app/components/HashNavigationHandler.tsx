'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function HashNavigationHandler() {
  const pathname = usePathname()

  useEffect(() => {
    console.log('HashNavigationHandler loaded, pathname:', pathname) // Debug
    console.log('Current hash:', window.location.hash) // Debug
    
    const handleHashNavigation = () => {
      const hash = window.location.hash
      if (hash) {
        console.log('Looking for element with id:', hash.slice(1)) // Debug
        
        // Mēģinām atrast elementu
        const element = document.getElementById(hash.slice(1))
        if (element) {
          console.log('Found element, scrolling...') // Debug
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        } else {
          console.log('Element not found, trying again later...') // Debug
          // Ja elements nav atrasts, mēģinām vēlreiz pēc 500ms
          setTimeout(() => {
            const retryElement = document.getElementById(hash.slice(1))
            if (retryElement) {
              console.log('Found element on retry, scrolling...') // Debug
              retryElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              })
            } else {
              console.log('Element still not found after retry') // Debug
            }
          }, 500)
        }
      }
    }

    // Pārbaudām uzreiz pēc lapas ielādes ar dažādiem timing
    setTimeout(handleHashNavigation, 1000)

    // Klausāmies hash izmaiņas
    window.addEventListener('hashchange', handleHashNavigation)
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation)
    }
  }, [pathname])

  // Šis komponents neko nerenderē
  return null
}
