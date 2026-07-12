import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Radio, CheckCircle2, ArrowRight, GraduationCap } from 'lucide-react'
import { courses } from '../data/courses'
import CTASection from '../components/home/CTASection'

export default function CourseDetail() {
  const { slug } = useParams()
  const course = courses.find((c) => c.slug === slug)

  if (!course) return <Navigate to="/training" replace />

  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 min-h-screen">
      <section className="container-x section-pad !pt-4 sm:!pt-6 md:!pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="eyebrow inline-flex items-center gap-1.5 sm:gap-2">
            <GraduationCap size={12} className="sm:w-[14px] sm:h-[14px]" /> 
            Training Program
          </span>
          <h1 className="mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink dark:text-white">
            {course.name}
          </h1>
          <p className="mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-ink/60 dark:text-slate-400 leading-relaxed">
            {course.tagline}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-ink/60 dark:text-slate-400">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Clock size={14} className="sm:w-[16px] sm:h-[16px]" /> 
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Radio size={14} className="sm:w-[16px] sm:h-[16px]" /> 
              {course.mode}
            </span>
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-medium">
              {course.level}
            </span>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/contact" className="btn-primary text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2">
              Enroll Now 
              <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
            </Link>
            <Link to="/training" className="btn-ghost text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2">
              All Programs
            </Link>
          </div>
        </motion.div>

        <div className="mt-12 sm:mt-14 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Curriculum Card */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <h2 className="font-semibold text-base sm:text-lg text-ink dark:text-white">
              Curriculum
            </h2>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {course.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
                  <CheckCircle2 size={14} className="sm:w-[17px] sm:h-[17px] text-primary mt-0.5 shrink-0" />
                  <span className="text-ink/75 dark:text-slate-300 leading-relaxed">{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects & Includes Card */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <h2 className="font-semibold text-base sm:text-lg text-ink dark:text-white">
              Projects you'll build
            </h2>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {course.projects.map((p) => (
                <li key={p} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
                  <CheckCircle2 size={14} className="sm:w-[17px] sm:h-[17px] text-secondary mt-0.5 shrink-0" />
                  <span className="text-ink/75 dark:text-slate-300 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
            
            <h2 className="font-semibold text-base sm:text-lg text-ink dark:text-white mt-6 sm:mt-8">
              Includes
            </h2>
            <ul className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-ink/70 dark:text-slate-300">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="text-primary mt-0.5">•</span>
                Verifiable certificate of completion
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="text-primary mt-0.5">•</span>
                Graded assignments with mentor feedback
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="text-primary mt-0.5">•</span>
                Lifetime access to session recordings
              </li>
            </ul>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  )
}