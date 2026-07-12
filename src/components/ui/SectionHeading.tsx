import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({ eyebrow, title, description, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'} mb-8 sm:mb-10 md:mb-12 lg:mb-14`}
    >
      <span className="eyebrow mb-2 sm:mb-3 md:mb-4">{eyebrow}</span>
      <h2 className="mt-2 sm:mt-3 md:mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base text-ink/60 dark:text-slate-300/70 leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  )
}