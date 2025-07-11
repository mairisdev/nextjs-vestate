import Navbar from '../components/Navbar'
import HashNavigationHandler from '../components/HashNavigationHandler'
import FirstSection from '../components/server/FirstSection'
import AgentReasons from '../components/server/AgentReasons'
import ServicesSection from '../components/ServicesSection'
import AgentsSection from '../components/server/AgentsSection'
import Testimonials from '../components/Testimonials'
import LegalConsultSection from '../components/LegalConsultSection'
import RecentSales from '../components/RecentSales'
import PrivateOffers from '../components/PrivateOffers'
import WhyChooseUs from '../components/WhyChooseUs'
import StatsSection from '../components/StatsSection'
import PartnersSection from '../components/PartnersSection'
import ContactSection from '../components/ContactSection'
import BlogSection from '../components/BlogSection'
import FooterSection from '../components/FooterSection'
import LegalConsultSection2 from '../components/LegalConsultSection2'
import CookieConsentBanner from '../components/CookieConsentBanner'
import HeroSliderServer from '../components/server/HeroSliderServer'

export default function Home() {
  return (
    <>
      <CookieConsentBanner />
      <HashNavigationHandler />
      <Navbar />
      <HeroSliderServer />
      <main className="min-h-screen">
        <FirstSection />
        <AgentReasons />
        <LegalConsultSection2 />
        <ServicesSection />
        <AgentsSection />
        <Testimonials />
        <LegalConsultSection />
        <RecentSales />
        <PrivateOffers />
        <WhyChooseUs />
        <StatsSection />
        <PartnersSection />
        <BlogSection />
        <ContactSection />
        <FooterSection />
      </main>
    </>
  )
}
