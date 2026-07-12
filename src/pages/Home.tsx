import Hero from '../components/home/Hero'
import WhyXeviqo from '../components/home/WhyXeviqo'
import TrainingPrograms from '../components/home/TrainingPrograms'
import FeaturedProjects from '../components/home/FeaturedProjects'
import Services from '../components/home/Services'
import DevServices from '../components/home/DevServices'
import LearningJourney from '../components/home/LearningJourney'
import Testimonials from '../components/home/Testimonials'
import Stats from '../components/home/Stats'
import FAQ from '../components/home/FAQ'
import CTASection from '../components/home/CTASection'

export default function Home() {
  return (
    <>
      <Hero />
      <WhyXeviqo />
      <TrainingPrograms />
      <FeaturedProjects />
      <Services />
      <DevServices />
      <LearningJourney />
      <Testimonials />
      <Stats />
      <FAQ />
      <CTASection />
    </>
  )
}
