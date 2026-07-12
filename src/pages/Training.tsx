import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, Radio, CheckCircle2, ArrowRight, Award } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import { courses } from '../data/courses'
import CTASection from '../components/home/CTASection'

export default function Training() {
  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32">
      <section className="container-x section-pad !pt-4 sm:!pt-6 md:!pt-8 !pb-6 sm:!pb-8 md:!pb-10 lg:!pb-12">
        <SectionHeading
          eyebrow="Training Programs"
          title="Structured to make you job-ready, not just certified"
          description="Two live, mentor-led tracks today — with the same format ready to support new languages and stacks as we grow."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 sm:p-6 md:p-7 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink dark:text-white">
                  {course.name}
                </h3>
                <Award size={18} className="sm:w-[20px] sm:h-[20px] text-primary" />
              </div>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-ink/60 dark:text-slate-400">
                {course.tagline}
              </p>

              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-ink/60 dark:text-slate-400">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Clock size={13} className="sm:w-[15px] sm:h-[15px]" /> 
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Radio size={13} className="sm:w-[15px] sm:h-[15px]" /> 
                  {course.mode}
                </span>
              </div>

              <h4 className="mt-5 sm:mt-7 text-xs sm:text-sm font-semibold text-ink/80 dark:text-slate-200">
                What you'll learn
              </h4>
              <ul className="mt-2 sm:mt-3 space-y-2 sm:space-y-2.5">
                {course.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 size={14} className="sm:w-[16px] sm:h-[16px] text-primary mt-0.5 shrink-0" />
                    <span className="text-ink/75 dark:text-slate-300">{topic}</span>
                  </li>
                ))}
              </ul>

              <h4 className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-ink/80 dark:text-slate-200">
                Projects you'll build
              </h4>
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {course.projects.map((p) => (
                  <span key={p} className="chip text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                    {p}
                  </span>
                ))}
              </div>

              <div className="mt-5 sm:mt-7 md:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
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
      </section>
      
      {/* CTA Section with proper spacing */}
      <div className="mt-2 sm:mt-4 md:mt-6 lg:mt-8">
        <CTASection />
      </div>
    </div>
  )
}