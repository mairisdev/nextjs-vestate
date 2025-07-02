'use client';

import { useState } from 'react';

const galleryTitle = 'PČ Hokejā 2025';

const images = [
  {
    src: 'https://martasmebeles.lv/content/images/preces/7791.jpg',
    shortDescription: 'Latvijas līdzjutēji pulcējas pie arēnas.',
  },
  {
    src: 'https://martasmebeles.lv/content/tmp/images/7791/universal-2400_450_2200_2.png',
    shortDescription: 'Uzvara pēcspēles metienos pret Čehiju!',
  },
  {
    src: 'https://martasmebeles.lv/content/tmp/images/7791/dub-kraft-zolotij-vidkritij.png',
    shortDescription: 'Komandas apskāvieni pēc uzvaras.',
  },
  {
    src: 'https://martasmebeles.lv/content/tmp/images/7791/universal-2400_450_2200__.png',
    shortDescription: 'Tribīnēs karogi un emocijas.',
  },
  {
    src: 'https://martasmebeles.lv/content/images/preces/16433.jpg',
    shortDescription: 'Spēles MVP intervija ar presi.',
  },
];

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + images.length - 1) % images.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-[#223645] mb-4 tracking-wide">
          {galleryTitle}
        </h1>

        <div
          className="cursor-pointer bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
          onClick={() => openModal(0)}
        >
          <img
            src={images[0].src}
            alt="Galvenais attēls"
            className="rounded-lg w-full object-cover aspect-video"
          />

          <p className="mt-6 text-[#223645] text-base">
            Lai skatītu vairāk foto no čempionāta, spiediet pogu zemāk!
          </p>

          <div className="mt-4 inline-block px-5 py-2 bg-[#BF3131] text-white text-sm rounded-full font-semibold shadow hover:bg-[#a92a2a] transition">
            Skatīt vairāk
          </div>
        </div>
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 md:p-10 relative shadow-xl mx-4">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-3xl font-bold"
              onClick={closeModal}
              aria-label="Aizvērt"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-[#223645] mb-2 text-center">
              {galleryTitle}
            </h2>

            <p className="text-sm text-gray-600 italic mb-4 text-center">
              {images[selectedIndex].shortDescription}
            </p>

            <img
              src={images[selectedIndex].src}
              alt={`Galerijas attēls ${selectedIndex + 1}`}
              className="rounded-lg mb-6 w-full object-cover"
            />

            {/* Thumbnail scroller */}
            <div className="flex gap-2 justify-center mt-4 mb-6 overflow-x-auto px-6 pb-5 custom-scroll">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-24 h-16 object-cover rounded-md border-1 mt-6 cursor-pointer transition-all ${
                    i === selectedIndex
                      ? 'ring-2 ring-[#BF3131] border-[#BF3131]'
                      : 'border-gray-200 hover:border-[#223645]'
                  }`}
                  alt={`Thumbnail ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                className="px-5 py-2 rounded-md bg-[#223645] text-white hover:bg-[#1b2c38] transition"
              >
                ← Iepriekšējā
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-md bg-[#BF3131] text-white hover:bg-[#a72828] transition"
              >
                Nākamā →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
