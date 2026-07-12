import { motion } from 'framer-motion'
import { Briefcase, MapPin } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import CTASection from '../components/home/CTASection'

const roles = [
  { title: 'Python Mentor (Part-time)', type: 'Contract', location: 'Remote' },
  { title: 'Java Mentor (Part-time)', type: 'Contract', location: 'Remote' },
  { title: 'Frontend Engineer Intern', type: 'Internship', location: 'Remote' },
]

export default function Careers() {
  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 min-h-screen">
      <section className="container-x section-pad !pt-4 sm:!pt-6 md:!pt-8">
        <SectionHeading
          eyebrow="Careers"
          title="Build the next chapter of Xeviqo with us"
          description="We're a small, product-minded team. As our services expand, so does our need for mentors and builders."
        />

        <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base text-ink dark:text-white">
                  {role.title}
                </h3>
                <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-ink/60 dark:text-slate-400">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Briefcase size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                    {role.type}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <MapPin size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                    {role.location}
                  </span>
                </div>
              </div>
              <a 
                href="mailto:careers@xeviqo.com" 
                className="btn-ghost !py-1.5 sm:!py-2 !px-4 sm:!px-5 text-xs sm:text-sm w-full sm:w-auto text-center"
              >
                Apply
              </a>
            </motion.div>
          ))}
        </div>
      </section>
      <CTASection />
    </div>
  )
}