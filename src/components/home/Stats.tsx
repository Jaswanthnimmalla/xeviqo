import AnimatedCounter from '../ui/AnimatedCounter'

type Stat = { value: number | string; suffix: string; label: string }

const stats: Stat[] = [
  { value: "Live", suffix: "", label: "Training Classes" },
  { value: "Real-Time", suffix: "", label: "Projects" },
  { value: "Web & App", suffix: "", label: "Development" },
  { value: 24, suffix: "/7", label: "Student Support" },
]

export default function Stats() {
  return (
    <section className="section-pad !py-6 sm:!py-8 md:!py-10 lg:!py-12">
      <div className="container-x">
        <div className="glass-card p-5 sm:p-6 md:p-8 lg:p-10 xl:p-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {stats.map((s, index) =>
            typeof s.value === 'number' ? (
              <AnimatedCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ) : (
              <div key={s.label} className="text-center group">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-ink dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-400">
                  {s.value}{s.suffix}
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm opacity-80 text-ink/70 dark:text-slate-400 mt-0.5 sm:mt-1 transition-colors duration-300 group-hover:text-ink dark:group-hover:text-slate-300">
                  {s.label}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}