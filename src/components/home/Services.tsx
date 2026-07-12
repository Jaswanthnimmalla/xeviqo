import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { services } from '../../data/services'

export default function Services() {
  return (
    <section className="section-pad section-alt !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Services"
          title="Training today. A technology company tomorrow."
          description="Xeviqo is built to grow past training — here's the full range we're building toward."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -4 }}
              className={`glass-card p-4 sm:p-5 md:p-6 relative ${s.status === 'coming-soon' ? 'opacity-90' : ''}`}
            >
              {s.status === 'coming-soon' && (
                <span className="absolute top-3 sm:top-4 md:top-5 right-3 sm:right-4 md:right-5 text-[8px] sm:text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-secondary bg-secondary/10 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1">
                  Coming Soon
                </span>
              )}
              <div className="grid h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary dark:text-primary-400">
                <s.icon size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px]" />
              </div>
              <h3 className="mt-3 sm:mt-4 md:mt-5 font-semibold text-sm sm:text-base text-ink dark:text-white">
                {s.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <Link to="/services" className="btn-ghost text-sm sm:text-base">
            Explore All Services <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
          </Link>
        </div>
      </div>
    </section>
  )
}