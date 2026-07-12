import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { testimonials } from '../../data/testimonials'

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const current = testimonials[index]

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length)
  }

  return (
    <section className="section-pad section-alt !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Student Testimonials"
          title="Learners who built real things"
        />

        <div className="max-w-2xl mx-auto relative px-2 sm:px-0">
          {/* Quote icon - hidden on mobile */}
          <Quote 
            className="hidden sm:block absolute -top-4 sm:-top-5 md:-top-6 left-4 sm:left-5 md:left-6 text-primary/15" 
            size={48} 
          />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-5 sm:p-6 md:p-8 lg:p-10 text-center"
            >
              <div className="flex justify-center gap-0.5 sm:gap-1 mb-3 sm:mb-4 md:mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`sm:w-[16px] sm:h-[16px] ${
                      i < current.rating 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-ink/15 dark:text-white/15'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-ink/80 dark:text-slate-200 px-1 sm:px-0">
                “{current.review}”
              </p>

              <div className="mt-5 sm:mt-6 md:mt-7 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <span className="grid h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                  {current.initials}
                </span>
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-xs sm:text-sm text-ink dark:text-white">
                    {current.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-ink/50 dark:text-slate-500">
                    {current.course}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 sm:mt-7 md:mt-8 flex items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="grid h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 place-items-center rounded-full border border-line-light dark:border-white/15 bg-white dark:bg-transparent shadow-sm hover:border-primary/50 transition-colors"
            >
              <ChevronLeft size={14} className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]" />
            </button>
            
            <div className="flex gap-1.5 sm:gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    i === index 
                      ? 'w-4 sm:w-5 md:w-6 bg-primary' 
                      : 'w-1.5 sm:w-2 bg-ink/15 dark:bg-white/15'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="grid h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 place-items-center rounded-full border border-line-light dark:border-white/15 bg-white dark:bg-transparent shadow-sm hover:border-primary/50 transition-colors"
            >
              <ChevronRight size={14} className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}