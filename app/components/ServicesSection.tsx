import { ChevronRight } from "lucide-react"
import { getTranslations } from 'next-intl/server';

export default async function ServicesZigZag() {
  const t = await getTranslations('ServicesSection');

  const services = [
    t('service1'),
    t('service2'), 
    t('service3'),
    t('service4'),
    t('service5'),
    t('service6'),
    t('service7'),
    t('service8'),
    t('service9'),
    t('service10'),
  ].filter(service => service && service.trim() !== '');

  if (services.length === 0) {
    return null;
  }

  const paired: string[][] = []
  for (let i = 0; i < services.length; i += 2) {
    paired.push([services[i], services[i + 1]])
  }

  return (
    <section id="pakalpojumi" className="bg-white py-8 sm:py-16 px-4 sm:px-12">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold uppercase text-[#77D4B4] text-center mb-2">
          {t('defaultSubheading')}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#00332D] text-center mb-16 sm:mb-20">
          {t('defaultHeading')}
        </h2>

        <div className="space-y-8 sm:space-y-10">
          {paired.map(([left, right], i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
              <div className="flex items-center gap-4 self-start">
                <div className="w-9 h-9 flex items-center justify-center">
                  <ChevronRight size={30} stroke="#77D4B4" strokeWidth={3} />
                </div>
                <p className="text-base leading-relaxed text-[#00332D]">{left}</p>
              </div>

              {right ? (
                <div className="flex items-center gap-4 self-start">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <ChevronRight size={30} stroke="#77D4B4" strokeWidth={3} />
                  </div>
                  <p className="text-base leading-relaxed text-[#00332D]">{right}</p>
                </div>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
