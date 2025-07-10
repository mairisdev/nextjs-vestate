import Navbar from './components/Navbar'
import HeroSlider from './components/HeroSlider'
import ConsultationSection from './components/ConsultationSection'
import AgentReasons from './components/AgentReasons'
import ServicesSection from './components/ServicesSection'
import AgentsSection from './components/AgentsSectionServer'
import Testimonials from './components/Testimonials'
import LegalConsultSection from './components/LegalConsultSection'
import RecentSales from './components/RecentSales'
import PrivateOffers from './components/PrivateOffers'
import WhyChooseUs from './components/WhyChooseUs'
import StatsSection from './components/StatsSection'
import PartnersSection from './components/PartnersSection'
import ContactSection from './components/ContactSection'
import BlogSection from './components/BlogSection'
import FooterSection from './components/FooterSection'
import LegalConsultSection2 from './components/LegalConsultSection2'

export default function Home() {
  return (
    <>
    <Navbar />
      <HeroSlider />
      <main className="min-h-screen">
        <ConsultationSection />
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
