import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  label: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AnimatedCounter({ 
  value, 
  suffix = '', 
  label,
  size = 'md' 
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, value])

  const sizeClasses = {
    sm: 'text-xl sm:text-2xl md:text-3xl',
    md: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    lg: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
  }

  const labelSizeClasses = {
    sm: 'text-[8px] sm:text-[10px] md:text-xs',
    md: 'text-[10px] sm:text-xs md:text-sm',
    lg: 'text-xs sm:text-sm md:text-base'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <span ref={ref} className={`font-display font-semibold gradient-text ${sizeClasses[size]}`}>
        {display}
        {suffix}
      </span>
      <p className={`mt-1 sm:mt-1.5 md:mt-2 ${labelSizeClasses[size]} text-ink/60 dark:text-slate-300/70`}>
        {label}
      </p>
    </motion.div>
  )
}