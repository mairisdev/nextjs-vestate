import { CheckCircle2 } from "lucide-react"
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
     
  return (
    <section id="pakalpojumi" className="bg-white py-16 sm:py-24 px-4 sm:px-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#77D4B4]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00332D]/5 to-transparent rounded-full blur-3xl"></div>
             
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#77D4B4]/10 rounded-full px-6 py-2 mb-4">
            <div className="w-2 h-2 bg-[#77D4B4] rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold uppercase text-[#77D4B4]">
              {t('defaultSubheading')}
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00332D] mb-4">
            {t('defaultHeading')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#77D4B4] to-[#5BC9A8] mx-auto rounded-full"></div>
        </div>

        {/* Services Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-6 lg:left-1/2 lg:transform lg:-translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-[#77D4B4] via-[#5BC9A8] to-[#77D4B4]"></div>
                     
          <div className="space-y-8 lg:space-y-12">
            {services.map((service, index) => (
              <div key={index} className="relative">
                {/* Mobile Layout */}
                <div className="flex lg:hidden w-full">
                  {/* Mobile dot */}
                  <div className="flex flex-shrink-0 w-4 h-4 bg-[#77D4B4] rounded-full border-4 border-white shadow-lg z-10 mt-3"></div>
                  
                  {/* Mobile card */}
                  <div className="flex-1 ml-6">
                    <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:shadow-[#77D4B4]/20 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#77D4B4] to-[#5BC9A8] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-base leading-relaxed text-[#00332D] font-medium">
                            {service}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#77D4B4] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block">
                  <div className="flex items-center justify-center">
                    {/* Center Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#77D4B4] rounded-full border-4 border-white shadow-lg z-10"></div>
                    
                    {/* Left side service (pāra numuri - 0, 2, 4...) */}
                    {index % 2 === 0 && (
                      <div className="w-5/12 pr-8">
                        <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:shadow-[#77D4B4]/20 transition-all duration-300 transform hover:-translate-y-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#77D4B4] to-[#5BC9A8] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-base leading-relaxed text-[#00332D] font-medium">
                                {service}
                              </p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-[#77D4B4] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Right side service (nepāra numuri - 1, 3, 5...) */}
                    {index % 2 === 1 && (
                      <div className="w-5/12 pl-8 ml-auto">
                        <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:shadow-[#77D4B4]/20 transition-all duration-300 transform hover:-translate-y-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#77D4B4] to-[#5BC9A8] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-base leading-relaxed text-[#00332D] font-medium">
                                {service}
                              </p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-[#77D4B4] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}