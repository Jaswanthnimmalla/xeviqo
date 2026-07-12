import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  { title: 'Register', desc: 'Pick your track and reserve your seat in the next live cohort.' },
  { title: 'Attend Classes', desc: 'Join live, mentor-led sessions built around real coding practice.' },
  { title: 'Assignments', desc: 'Reinforce every concept with graded, hands-on assignments.' },
  { title: 'Mini Projects', desc: 'Apply multiple concepts together in small, shippable builds.' },
  { title: 'Major Project', desc: 'Design and build a complete project from scratch, with mentor review.' },
  { title: 'Certificate', desc: 'Receive your verifiable Xeviqo certificate on successful completion.' },
  { title: 'Internship Opportunity', desc: 'Strong performers get access to internship pathways.' },
  { title: 'Career Support', desc: 'Ongoing guidance on portfolios, interviews, and next roles.' },
]

export default function LearningJourney() {
  return (
    <section className="section-pad !py-8 sm:!py-10 md:!py-12 lg:!py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Learning Journey"
          title="A clear path from registration to career"
          description="The same eight-step journey every learner follows — because the order genuinely matters."
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:block absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2" />

          <div className="space-y-6 sm:space-y-7 md:space-y-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className={`relative flex items-start gap-3 sm:gap-4 md:gap-5 md:w-1/2 ${
                  i % 2 === 0 ? 'md:ml-0 md:pr-8 md:text-right md:flex-row-reverse' : 'md:ml-auto md:pl-8'
                }`}
              >
                {/* Step number */}
                <span className="shrink-0 grid h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[10px] sm:text-xs md:text-sm font-semibold shadow-glow md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
                  {i + 1}
                </span>
                
                {/* Content card */}
                <div className="glass-card p-3 sm:p-4 md:p-5 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-ink dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs md:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}