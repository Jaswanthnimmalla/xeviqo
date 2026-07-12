import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Code2,
  BookOpen,
  Users,
  Users2,
  Briefcase,
  Cloud,
  Cpu,
  Award,
  Monitor,
  Database,
  Terminal,
  Globe,
  Smartphone,
  Brain,
  Zap,
  Rocket,
  Shield,
  Star,
  Layers,
  Target,
  Compass,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../ui/AnimatedCounter'

export default function Hero() {
  // Get the image from images folder
  const heroImage = '/images/home.png'

  return (
   <section
  className="relative overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-10 md:pt-28 md:pb-12 lg:pt-32 lg:pb-0 lg:min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 transition-colors duration-300"
>
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        
        <div className="absolute inset-0 opacity-20 sm:opacity-25 md:opacity-30">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-indigo-400/20 via-transparent to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-400/20 via-transparent to-transparent blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-400/10 blur-3xl animate-pulse delay-500" />
          <div className="absolute top-1/4 right-1/4 w-1/3 h-1/3 bg-fuchsia-400/10 blur-3xl animate-pulse delay-1500" />
        </div>

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 dark:via-indigo-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 dark:via-cyan-500/50 to-transparent" />
      </div>

      {/* Animated Orbs */}
      <div className="hidden sm:block absolute -top-40 -right-40 w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-indigo-400/25 dark:bg-indigo-600/25 rounded-full blur-3xl animate-pulse" />
      <div className="hidden sm:block absolute -bottom-40 -left-40 w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-cyan-400/25 dark:bg-cyan-600/25 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] md:w-[700px] h-[500px] sm:h-[600px] md:h-[700px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-float" />
      <div className="hidden lg:block absolute top-1/4 right-1/4 w-60 sm:w-72 md:w-80 h-60 sm:h-72 md:h-80 bg-fuchsia-400/10 dark:bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse delay-1500" />
      
      {/* Floating particles */}
      <div className="absolute top-20 left-10 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_3px_rgba(99,102,241,0.3)] animate-float" style={{ animationDelay: '0.5s', display: window.innerWidth < 640 ? 'none' : 'block' }} />
      <div className="absolute top-40 right-20 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_15px_5px_rgba(34,211,238,0.25)] animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-32 left-20 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 shadow-[0_0_10px_3px_rgba(139,92,246,0.3)] animate-float" style={{ animationDelay: '2.5s' }} />
      <div className="hidden sm:block absolute bottom-40 right-10 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-pink-400 shadow-[0_0_15px_5px_rgba(236,72,153,0.25)] animate-float" style={{ animationDelay: '3.5s' }} />
      <div className="hidden md:block absolute top-1/3 left-1/4 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_3px_rgba(251,191,36,0.25)] animate-float" style={{ animationDelay: '2s' }} />
      <div className="hidden lg:block absolute bottom-1/3 right-1/4 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_3px_rgba(52,211,153,0.25)] animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-16 xl:gap-20 items-center relative z-10">
        {/* Left Column - Content (Now first on mobile) */}
        <div className="order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-indigo-400/40 dark:border-indigo-500/30 bg-indigo-100/60 dark:bg-indigo-500/10 backdrop-blur-sm text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.08)]"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles
                size={12}
                className="sm:w-[14px] sm:h-[14px] text-cyan-500 dark:text-cyan-400"
              />
            </motion.span>
            <span className="whitespace-nowrap">NOW TRAINING OUR NEXT COHORT</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 sm:mt-5 md:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]"
          >
            <motion.span
              className="text-slate-900 dark:text-white inline-block"
              animate={{
                textShadow: [
                  "0 0 0px rgba(99,102,241,0)",
                  "0 0 20px rgba(99,102,241,0.08)",
                  "0 0 0px rgba(99,102,241,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Learn.
            </motion.span>

            <br />

            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Build.
            </span>

            <br />

            <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500 dark:from-purple-400 dark:via-fuchsia-400 dark:to-orange-400 bg-clip-text text-transparent">
              Innovate.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-3 sm:mt-4 md:mt-6 max-w-lg text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300/80 leading-relaxed"
          >
            Xeviqo empowers students and aspiring developers through practical
            programming training and real-world project development — built like a
            technology company, not a coaching class.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 sm:mt-7 md:mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Link
              to="/contact"
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm sm:text-base font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Enroll Now</span>
              <ArrowRight
                size={16}
                className="sm:w-[18px] sm:h-[18px] relative z-10 group-hover:translate-x-1 transition-transform"
              />
            </Link>

            <Link
              to="/projects"
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full border border-slate-300 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 text-sm sm:text-base font-semibold overflow-hidden transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Explore Projects</span>
            </Link>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
          >
            {[
              {
                title: "Training",
                subtitle: "Skill Development",
              },
              {
                title: "Projects",
                subtitle: "Academic & Live",
              },
              {
                title: "Software",
                subtitle: "Web & Android Apps",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 250 }}
                className="group flex flex-col items-center justify-center text-center min-h-[70px] sm:min-h-[80px] md:min-h-[90px]"
              >
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:bg-clip-text">
                  {stat.title}
                </h3>

                <p className="mt-0.5 sm:mt-1 md:mt-2 max-w-[160px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px] text-[10px] sm:text-xs md:text-sm leading-5 sm:leading-6 text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-indigo-400 dark:group-hover:text-indigo-400">
                  {stat.subtitle}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Column - Image (Now second on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="order-2 flex justify-center items-center w-full mt-2 sm:mt-4 lg:mt-0 mb-4 lg:mb-0"
        >
          <img
            src={heroImage}
            alt="Xeviqo Hero"
            className="
  w-[78%]
  sm:w-[82%]
  md:w-[72%]
  lg:w-full
  max-w-[330px]
  sm:max-w-[420px]
  md:max-w-[520px]
  lg:max-w-[620px]
  h-auto
  object-contain
"
            loading="eager"
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  )
}