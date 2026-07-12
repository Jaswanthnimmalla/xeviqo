import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, Radio, CheckCircle2, ArrowRight } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { courses } from '../../data/courses'

export default function TrainingPrograms() {
  return (
    <section className="section-pad section-alt !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Training Programs"
          title="Pick a language. Build something real."
          description="Two focused tracks today — designed so new tracks can slot in without touching what already works."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card p-5 sm:p-6 md:p-7 lg:p-8 relative overflow-hidden"
            >
              <div
                className={`absolute -top-16 -right-16 h-32 sm:h-36 md:h-40 w-32 sm:w-36 md:w-40 rounded-full blur-3xl opacity-30 ${
                  course.color === 'primary' ? 'bg-primary' : 'bg-secondary'
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink dark:text-white">
                  {course.name}
                </h3>
                <span className="text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 sm:px-3 py-0.5 sm:py-1 inline-block w-fit">
                  Beginner friendly
                </span>
              </div>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-ink/60 dark:text-slate-400">
                {course.tagline}
              </p>

              <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-ink/60 dark:text-slate-400">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Clock size={13} className="sm:w-[15px] sm:h-[15px]" /> 
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Radio size={13} className="sm:w-[15px] sm:h-[15px]" /> 
                  {course.mode}
                </span>
              </div>

              <ul className="mt-4 sm:mt-5 md:mt-6 space-y-2 sm:space-y-2.5">
                {course.topics.slice(0, 3).map((topic) => (
                  <li key={topic} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 size={14} className="sm:w-[16px] sm:h-[16px] text-primary mt-0.5 shrink-0" />
                    <span className="text-ink/75 dark:text-slate-300">{topic}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 sm:mt-6 md:mt-7 lg:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <Link 
                  to="/contact" 
                  className="btn-primary !py-2 sm:!py-2.5 text-center text-sm sm:text-base flex-1 sm:flex-none"
                >
                  Enroll Now
                </Link>
                <Link 
                  to={`/training/${course.slug}`} 
                  className="btn-ghost !py-2 sm:!py-2.5 text-center text-sm sm:text-base flex-1 sm:flex-none"
                >
                  Course Details <ArrowRight size={13} className="sm:w-[14px] sm:h-[14px]" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}