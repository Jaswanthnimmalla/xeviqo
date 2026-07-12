import { motion } from 'framer-motion'
import {
  UserCheck, Radio, Code, Layers, Compass, Infinity as InfinityIcon, Award, Wallet,
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'

const features = [
  { icon: UserCheck, title: 'Experienced Mentorship', desc: 'Learn directly from engineers who build software professionally, not just teach syntax.' },
  { icon: Radio, title: 'Live Online Classes', desc: 'Real-time sessions with room to ask, debug, and think out loud — never pre-recorded filler.' },
  { icon: Code, title: 'Hands-on Coding', desc: 'You write code from day one. Every concept is paired with something you build yourself.' },
  { icon: Layers, title: 'Project Based Learning', desc: 'Skills are taught through progressively harder projects, not isolated exercises.' },
  { icon: Compass, title: 'Career Guidance', desc: 'Direction on portfolios, interviews, and next steps once your training wraps up.' },
  { icon: InfinityIcon, title: 'Lifetime Resources', desc: 'Recordings, notes, and materials stay with you long after the cohort ends.' },
  { icon: Award, title: 'Certification', desc: 'A verifiable certificate on completion of assignments and your final project.' },
  { icon: Wallet, title: 'Affordable Fees', desc: 'Premium mentorship and project guidance, priced for students.' },
]

export default function WhyXeviqo() {
  return (
    <section className="!pt-0 !pb-16 sm:!pb-20 md:!pb-24 lg:!pb-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why Xeviqo"
          title="Training that behaves like a product team"
          description="Every part of the experience is designed the way we'd build software — deliberate, iterative, and outcome-driven."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card p-4 sm:p-5 md:p-6 group hover:shadow-glow hover:border-primary/30"
            >
              <div className="grid h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary dark:text-primary-400 group-hover:from-primary group-hover:to-secondary group-hover:text-white transition-all duration-300">
                <f.icon size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px]" />
              </div>
              <h3 className="mt-3 sm:mt-4 md:mt-5 font-semibold text-sm sm:text-base text-ink dark:text-white">
                {f.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}