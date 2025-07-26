'use client'
import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getImageUrl } from "@/lib/imageUtils"

interface PropertyImageGalleryProps {
  images: string[]
  title: string
  videoUrl?: string | undefined
  mainImage?: string | null | undefined
}

export default function PropertyImageGallery({ images, title, videoUrl, mainImage }: PropertyImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  console.log('🎬 PropertyImageGallery received:', {
    mainImage,
    images,
    imagesCount: images?.length,
    videoUrl
  })

  // Apvienojam mainImage ar images masīvu un filtrējam tukšos
  const allImages = []
  
  // Vispirms pievienojam mainImage, ja tas eksistē
  if (mainImage && mainImage.trim() !== '') {
    allImages.push(mainImage)
  }
  
  // Pēc tam pievienojam papildu attēlus, bet tikai tos, kas nav mainImage
  if (Array.isArray(images)) {
    const additionalImages = images.filter(img => 
      img && 
      img.trim() !== '' && 
      img !== mainImage // Izvairies no dublēšanās
    )
    allImages.push(...additionalImages)
  }

  // Filtrējam tukšos attēlus
  const validImages = allImages.filter(img => img && img.trim() !== '')

  if (validImages.length === 0) {
    console.log('🚫 No valid images found:', {
      mainImage,
      images,
      allImages,
      validImages
    })
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Nav pievienoti attēli</p>
        </div>
      </div>
    )
  }

  console.log('✅ Valid images found:', {
    total: validImages.length,
    images: validImages
  })

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  const openLightbox = (index: number) => {
    setCurrentImage(index)
    setShowLightbox(true)
  }

  // Helper funkcija attēlu URL iegūšanai
  const getImageSrc = (imagePath: string) => {
    const url = getImageUrl(imagePath)
    console.log('🖼️ Image processing:', {
      input: imagePath,
      output: url,
      isCloudinary: imagePath?.includes('cloudinary.com')
    })
    return url || '/placeholder-property.jpg'
  }

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* Attēlu galerija */}
        {validImages.length > 0 && (
          <>
            {/* Galvenais attēls */}
            <div className="relative mb-4">
              <div className="h-96 md:h-[500px] bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={getImageSrc(validImages[currentImage])}
                  alt={`${title} - attēls ${currentImage + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(currentImage)}
                />
              </div>
              
              {/* Navigation arrows */}
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImage + 1} / {validImages.length}
              </div>
            </div>

            {/* Thumbnail navigation */}
            {validImages.length > 1 && (
              <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`relative h-16 md:h-20 bg-gray-200 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImage 
                        ? 'border-[#00332D] ring-2 ring-[#00332D] ring-opacity-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getImageSrc(image)}
                      alt={`${title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && validImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            {/* Close button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <img
              src={getImageSrc(validImages[currentImage])}
              alt={`${title} - attēls ${currentImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {currentImage + 1} / {validImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}