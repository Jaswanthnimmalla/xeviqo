import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="section-pad !py-2 sm:!py-3 md:!py-4 lg:!py-6 !pb-4 sm:!pb-6 md:!pb-8 lg:!pb-10">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center text-white"
        >
          <div className="absolute inset-0 bg-grid opacity-10" />
          
          <h2 className="relative font-display text-2xl sm:text-3xl md:text-4xl font-semibold max-w-xl mx-auto leading-tight">
            Ready to learn today and build tomorrow?
          </h2>
          
          <p className="relative mt-3 sm:mt-4 max-w-md mx-auto text-white/80 text-sm sm:text-base px-2 sm:px-0">
            Join the next Xeviqo cohort and turn your first line of code into a real, defensible project.
          </p>
          
          <div className="relative mt-6 sm:mt-7 md:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white text-ink px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:scale-105 transition-transform w-full sm:w-auto justify-center"
            >
              Enroll Now 
              <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
            </Link>
            <Link 
              to="/projects" 
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/40 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              Explore Projects
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}