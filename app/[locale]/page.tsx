import Navbar from '../components/Navbar'
import HashNavigationHandler from '../components/HashNavigationHandler'
import FirstSection from '../components/server/FirstSectionServer'
import AgentReasons from '../components/server/AgentReasonsServer'
import ServicesSection from '../components/ServicesSection'
import AgentsSection from '../components/server/AgentsSectionServer'
import TestimonialsSection from '../components/server/TestimonialsServer'
import LegalConsultSection from '../components/LegalConsultSection'
import RecentSales from '../components/server/RecentSalesServer'
import PrivateOffers from '../components/PrivateOffers'
import WhyChooseUs from '../components/server/WhyChooseUsServer'
import StatsSection from '../components/server/StatsSectionServer'
import PartnersSection from '../components/server/PartnersSectionServer'
import ContactSection from '../components/ContactSection'
import BlogSection from '../components/BlogSection'
import FooterSection from '../components/FooterSection'
import LegalConsultSection2 from '../components/SevenSection'
import CookieConsentBanner from '../components/CookieConsentBanner'
import HeroSlider from '../components/server/HeroSliderServer'
import { ContactSectionServer, FooterSectionServer } from '../components/server/ContactFooterServer'

export default function Home() {
  return (
    <>
      <CookieConsentBanner />
      <HashNavigationHandler />
      <Navbar />
      <HeroSlider />
      <main className="min-h-screen">
        <FirstSection />
        <AgentReasons />
        <LegalConsultSection2 />
        <ServicesSection />
        <AgentsSection />
        <TestimonialsSection />
        <LegalConsultSection />
        <RecentSales />
        <PrivateOffers />
        <WhyChooseUs />
        <StatsSection />
        <PartnersSection />
        <BlogSection />
        <ContactSectionServer />
        <FooterSectionServer />
      </main>
    </>
  )
}
