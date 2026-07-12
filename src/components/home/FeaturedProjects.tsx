import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, FileText } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { projects } from '../../data/projects'

export default function FeaturedProjects() {
  const featured = projects.slice(0, 4)

  return (
    <section className="section-pad !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Final Year Projects"
          title="Academic projects built to be defended, not just submitted"
          description="Eight technology categories and growing — each project scoped with real features you can explain in a viva."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card p-4 sm:p-5 md:p-6 flex flex-col"
            >
              <span className="eyebrow self-start !text-[8px] sm:!text-[9px] md:!text-[10px]">
                {p.category}
              </span>
              <h3 className="mt-3 sm:mt-4 font-semibold text-sm sm:text-base leading-snug text-ink dark:text-white">
                {p.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 flex-1 line-clamp-3">
                {p.description}
              </p>
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <Link 
                  to="/projects" 
                  className="flex items-center gap-1 sm:gap-1.5 text-primary font-medium hover:underline transition-all"
                >
                  <Eye size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                  <span>Demo</span>
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center gap-1 sm:gap-1.5 text-ink/60 dark:text-slate-400 font-medium hover:text-primary dark:hover:text-primary-400 transition-colors"
                >
                  <FileText size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                  <span>Request</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <Link to="/projects" className="btn-ghost text-sm sm:text-base">
            View All Projects <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
          </Link>
        </div>
      </div>
    </section>
  )
}