import Navbar from './components/Navbar'
import HeroSlider from './components/HeroSlider'
import ConsultationSection from './components/ConsultationSection'
import AgentReasons from './components/AgentReasons'
import ServicesSection from './components/ServicesSection'

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSlider />
      <main className="min-h-screen">
        <ConsultationSection />
        <AgentReasons />
        <ServicesSection />
      </main>
    </>
  )
}
