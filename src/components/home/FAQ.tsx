import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { faqs } from '../../data/faqs'

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="section-pad section-alt !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={faq.question} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 md:py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-xs sm:text-sm md:text-base text-ink dark:text-white leading-snug">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-primary/10 text-primary"
                  >
                    <Plus size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}