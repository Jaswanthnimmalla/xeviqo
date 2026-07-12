import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Code2, Globe, Smartphone, ArrowRight, IndianRupee, Check } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'

const offerings = [
  {
    icon: Code2,
    title: 'Software Projects',
    desc: 'Custom desktop, web-backed, and academic software — built to spec, not templated.',
    points: ['Requirement-based scoping', 'Source code + documentation', 'Post-delivery support'],
  },
  {
    icon: Globe,
    title: 'Websites',
    desc: 'Business, portfolio, and e-commerce websites that load fast and look professional.',
    points: ['Responsive on every device', 'SEO-ready structure', 'Fast turnaround'],
  },
  {
    icon: Smartphone,
    title: 'Android Apps',
    desc: 'Native and cross-platform Android apps for startups, students, and small businesses.',
    points: ['Play Store-ready builds', 'Clean, modern UI', 'Ongoing maintenance available'],
  },
]

export default function DevServices() {
  return (
    <section className="section-pad !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Development Services"
          title={
            <>
              Software, websites & Android apps —{' '}
              <span className="gradient-text">budget-friendly</span>
            </>
          }
          description="We build real, working products for students, startups, and small businesses — priced to fit your budget, without cutting corners on quality."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {offerings.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-5 sm:p-6 md:p-7 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
                  <o.icon size={18} className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]" />
                </div>
                <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] md:text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                  <IndianRupee size={9} className="sm:w-[10px] sm:h-[10px] md:w-[11px] md:h-[11px]" /> 
                  Budget Friendly
                </span>
              </div>

              <h3 className="mt-4 sm:mt-5 font-semibold text-base sm:text-lg text-ink dark:text-white">
                {o.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                {o.desc}
              </p>

              <ul className="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5 flex-1">
                {o.points.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-ink/70 dark:text-slate-300">
                    <Check size={13} className="sm:w-[14px] sm:h-[14px] md:w-[15px] md:h-[15px] mt-0.5 text-primary shrink-0" /> 
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className="mt-5 sm:mt-6 inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-primary dark:text-primary-400 hover:gap-2 sm:hover:gap-2.5 transition-all group"
              >
                <span>Get a free quote</span>
                <ArrowRight size={13} className="sm:w-[14px] sm:h-[14px] md:w-[15px] md:h-[15px] group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}