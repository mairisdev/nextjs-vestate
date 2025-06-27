export default function ServicesZigZag() {
  const services = [
    'Pārstāv jūsu intereses visa pārdošanas procesa gaitā.',
    'Konsultē par tirgus situāciju, īpašuma vērtību un pārdošanas nosacījumiem.',
    'Sniedz info par nodokļiem, piemērojamiem likumiem.',
    'Palīdz sagatavot darījuma dokumentus un sakārtot pārvaldības jautājumus.',
    'Veic profesionālu mārketingu un sludinājumu izvietošanu.',
    'Komunicē ar interesentiem, saskaņo apskates.',
    'Palīdz pircējam visos kredīta un pirkuma procesa posmos.',
    'Koordinē darījuma gaitu ar notāriem, īpašniekiem, pircējiem.',
    'Rūpējas, lai īpašniekam ir pēc iespējas mazāks slogs darījumā.',
  ]

  // Sadala sarakstu divās kolonnās, katrā katrs otrais elements
  const leftItems = services.filter((_, idx) => idx % 2 === 0)
  const rightItems = services.filter((_, idx) => idx % 2 === 1)

  return (
    <section className="bg-white py-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold uppercase text-[#77D4B4] text-center mb-2">
          Pieredzes bagāti nekustamo īpašumu speciālisti
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#00332D] text-center mb-20">
          Pakalpojumi, ko sniedz mūsu komanda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-12 md:gap-x-20">
          {leftItems.map((text, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-9 h-9 flex items-center justify-center border-2 border-[#77D4B4] rounded-full text-[#77D4B4] font-bold text-base shrink-0">
                {idx * 2 + 1}
              </div>
              <p className="text-base leading-relaxed text-[#00332D]">{text}</p>
            </div>
          ))}

          {rightItems.map((text, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-9 h-9 flex items-center justify-center border-2 border-[#77D4B4] rounded-full text-[#77D4B4] font-bold text-base shrink-0">
                {idx * 2 + 2}
              </div>
              <p className="text-base leading-relaxed text-[#00332D]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
