import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Target,
  Eye,
  Rocket,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  Award,
  Code2,
  GraduationCap,
  Star,
  Play,
  Linkedin,
  ChevronRight,
  Globe,
  Sun,
  Moon,
  Monitor,
  Cloud,
  Cpu,
  BookOpen,
  Laptop,
  Wifi,
  BadgeCheck,
  UserCog,
} from 'lucide-react'
import CTASection from '../components/home/CTASection'
import { useTheme } from '../context/ThemeContext'

/* ================================================================== */
/*  DATA                                                              */
/* ================================================================== */

const statsData = [
  { 
    icon: GraduationCap, 
    label: 'Training Programs', 
    value: 'Live',
    gradient: 'from-violet-500 to-purple-600',
  },
  { 
    icon: Code2, 
    label: 'Live Projects', 
    value: 'Real-Time',
    gradient: 'from-blue-500 to-cyan-600',
  },
  { 
    icon: Globe, 
    label: 'Learning Mode', 
    value: 'Online',
    gradient: 'from-emerald-500 to-teal-600',
  },
  { 
    icon: Award, 
    label: 'Web & Apps', 
    value: 'Custom',
    gradient: 'from-amber-500 to-orange-600',
  },
  { 
    icon: Users, 
    label: 'Expert Guidance', 
    value: 'Dedicated',
    gradient: 'from-pink-500 to-rose-600',
  },
]

const values = [
  { icon: GraduationCap, title: 'Quality Education', desc: 'High-quality, up-to-date content designed by industry experts.' },
  { icon: Code2, title: 'Hands-on Learning', desc: 'Practical approach with real projects to build strong portfolios.' },
  { icon: Users, title: 'Community First', desc: 'A collaborative community that supports, inspires, and grows together.' },
  { icon: Target, title: 'Career Focused', desc: 'From skills to placements, we help you achieve your dream career.' },
  { icon: Rocket, title: 'Innovation Driven', desc: 'We embrace innovation and prepare you for the future of technology.' },
]

const journey = [
  { title: 'The Beginning', desc: 'Xeviqo was founded with a mission to transform learning.', color: 'text-violet-400', dot: 'bg-violet-500' },
  { title: 'Growing Together', desc: 'Launched multiple courses and built our amazing learning community.', color: 'text-blue-400', dot: 'bg-blue-500' },
  { title: 'Expanding Horizons', desc: 'Introduced internships, mentorship programs, and real-world projects.', color: 'text-emerald-400', dot: 'bg-emerald-500' },
  { title: 'Stronger Impact', desc: 'Reached thousands of learners and achieved 95%+ satisfaction.', color: 'text-orange-400', dot: 'bg-orange-500' },
  { title: 'The Future', desc: 'Continuing our mission to empower millions and build brighter futures.', color: 'text-pink-400', dot: 'bg-pink-500' },
]

/* ------------------------------------------------------------------ */
/*  MENTOR PHOTOS                                                     */
/* ------------------------------------------------------------------ */
const mentors = [
  { name: 'Jaswanth', role: 'Flutter Developer', image: '/images/mentors/ceo.jpeg', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Balaji', role: 'Java Developer', image: '/images/mentors/balu.jpeg', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Mohammad Kaif', role: 'Python Developer', image: '/images/mentors/kaif.jpeg', gradient: 'from-red-500 to-orange-500' },
  { name: 'Chaithanya', role: 'SQL Developer', image: '/images/mentors/Chaitu.jpeg', gradient: 'from-emerald-500 to-teal-500' },
]

/* ------------------------------------------------------------------ */
/*  STUDENT AVATARS                                                   */
/* ------------------------------------------------------------------ */
const studentAvatars = [
  { name: 'Student 1', image: '/images/students/student-1.jpg', gradient: 'from-violet-500 to-purple-500' },
  { name: 'Student 2', image: '/images/students/student-2.jpg', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Student 3', image: '/images/students/student-3.jpg', gradient: 'from-cyan-500 to-blue-500' },
]

/* ================================================================== */
/*  PHOTO WITH FALLBACK                                               */
/* ================================================================== */
const PhotoWithFallback = ({
  src,
  name,
  gradient,
  className = '',
  loading = 'lazy',
}: {
  src: string
  name: string
  gradient: string
  className?: string
  loading?: 'lazy' | 'eager'
}) => {
  const [errored, setErrored] = useState(false)
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold ${className}`}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      loading={loading}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  )
}

/* ================================================================== */
/*  Xeviqo Logo - X Mark with Glow                                    */
/* ================================================================== */
const XeviqoLogo = () => (
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="logoGradAbout" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#22D3EE" />
      </linearGradient>
      <filter id="logoGlowAbout" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="14" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#logoGlowAbout)">
      <line x1="80" y1="120" x2="320" y2="280" stroke="url(#logoGradAbout)" strokeWidth="22" strokeLinecap="round" />
      <line x1="320" y1="120" x2="80" y2="280" stroke="url(#logoGradAbout)" strokeWidth="22" strokeLinecap="round" />
    </g>
    <line x1="85" y1="125" x2="315" y2="275" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
    <line x1="315" y1="125" x2="85" y2="275" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
  </svg>
)

/* ================================================================== */
/*  Orbit item data                                                    */
/* ================================================================== */
type OrbitItem = {
  icon: React.ReactNode
  label: string
  gradient: string
  glow: string
}

const outerItems: OrbitItem[] = [
  { icon: <Monitor size={20} />, label: 'Live Classes', gradient: 'from-sky-500 to-blue-600', glow: 'shadow-sky-500/50' },
  { icon: <Code2 size={20} />, label: 'Real Projects', gradient: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/50' },
  { icon: <Award size={20} />, label: 'Certifications', gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/50' },
  { icon: <Briefcase size={20} />, label: 'Placements', gradient: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/50' },
  { icon: <Users size={20} />, label: 'Expert Mentors', gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/50' },
]

const innerItems: OrbitItem[] = [
  { icon: <Cloud size={18} />, label: 'Cloud Labs', gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/50' },
  { icon: <Cpu size={18} />, label: 'AI Tools', gradient: 'from-fuchsia-500 to-pink-600', glow: 'shadow-fuchsia-500/50' },
]

/* ================================================================== */
/*  Orbit Ring - badges stay upright while orbiting                   */
/* ================================================================== */
const OrbitRing = ({
  items,
  radius,
  duration,
  reverse = false,
  badgeSize = 60,
}: {
  items: OrbitItem[]
  radius: number
  duration: number
  reverse?: boolean
  badgeSize?: number
}) => {
  return (
    <div className="absolute inset-0">
      <style>{`
        @keyframes aboutOrbitMove {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aboutOrbitMoveReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes aboutCounterOrbit {
          from { transform: rotate(calc(-1 * var(--angle))); }
          to   { transform: rotate(calc(-1 * var(--angle) - 360deg)); }
        }
        @keyframes aboutCounterOrbitReverse {
          from { transform: rotate(calc(-1 * var(--angle))); }
          to   { transform: rotate(calc(-1 * var(--angle) + 360deg)); }
        }
      `}</style>
      {items.map((item, index) => {
        const angle = (360 / items.length) * index
        return (
          <div
            key={item.label}
            className="absolute"
            style={{
              width: badgeSize,
              height: badgeSize,
              left: `calc(50% - ${badgeSize / 2}px)`,
              top: `calc(50% - ${badgeSize / 2}px)`,
              animation: reverse ? 'aboutOrbitMoveReverse' : 'aboutOrbitMove',
              animationDuration: `${duration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              transformOrigin: 'center center',
            }}
          >
            <div
              className="absolute"
              style={{
                transform: `rotate(${angle}deg) translateX(${radius}px)`,
                transformOrigin: 'center center',
                width: badgeSize,
                height: badgeSize,
              }}
            >
              <div
                className="flex flex-col items-center gap-1 w-full h-full"
                style={{
                  ['--angle' as any]: `${angle}deg`,
                  animation: reverse ? 'aboutCounterOrbitReverse' : 'aboutCounterOrbit',
                  animationDuration: `${duration}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} border-2 border-white/60 dark:border-white/20 shadow-xl ${item.glow} text-white flex-shrink-0 transition-transform duration-300 hover:scale-110`}
                  style={{ width: badgeSize * 0.85, height: badgeSize * 0.85 }}
                >
                  {item.icon}
                </div>
                <div className="text-center whitespace-nowrap rounded-full px-2 py-0.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/70 dark:border-white/10 shadow-sm">
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-white leading-tight">
                    {item.label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ================================================================== */
/*  Hero orbit visual                                                  */
/* ================================================================== */
const OrbitVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative flex items-center justify-center w-full"
    >
      {/* Responsive outer box */}
      <div
        className="relative flex items-center justify-center
                   w-[230px] h-[230px]
                   sm:w-[300px] sm:h-[300px]
                   md:w-[380px] md:h-[380px]
                   lg:w-[420px] lg:h-[420px]
                   max-w-full"
      >
        {/* Fixed 420x420 canvas, scaled down to fit the box above */}
        <div
          className="relative w-[420px] h-[420px] flex-shrink-0 origin-center
                     scale-[0.548] sm:scale-[0.714] md:scale-[0.905] lg:scale-100
                     transition-transform duration-300"
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="aboutRingGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="aboutRingGradInner" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
            <circle cx="50%" cy="50%" r="175" fill="none" stroke="url(#aboutRingGradOuter)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 10" />
            <circle cx="50%" cy="50%" r="112" fill="none" stroke="url(#aboutRingGradInner)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 10" />
          </svg>

          <div className="absolute top-[9%] left-[16%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_4px_rgba(34,211,238,0.5)]" />
          <div className="absolute bottom-[9%] right-[16%] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_4px_rgba(251,191,36,0.5)]" />

          <OrbitRing items={outerItems} radius={175} duration={28} reverse={false} badgeSize={54} />
          <OrbitRing items={innerItems} radius={112} duration={20} reverse={true} badgeSize={46} />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex flex-col items-center justify-center gap-2">
              <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-cyan-400/30 dark:from-indigo-500/25 dark:via-purple-500/25 dark:to-cyan-500/25 blur-3xl animate-pulse" />
              <motion.div
                className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_25px_rgba(139,92,246,0.55)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <XeviqoLogo />
              </motion.div>
              <span className="relative text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                Xeviqo
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/*  PAGE - Theme Toggle Button REMOVED                                */
/* ================================================================== */
export default function About() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-slate-50'
    } overflow-hidden`}>
      {/* Theme Toggle Button REMOVED - Now only in App Bar */}

      {/* ============================= HERO ============================= */}
      <section className={`relative overflow-hidden pt-16 pb-12 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-slate-50'
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${
          isDark 
            ? 'from-indigo-950/40 via-slate-950 to-slate-950' 
            : 'from-indigo-100/40 via-slate-50 to-slate-50'
        }`} />
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl ${
          isDark ? 'bg-purple-600/10' : 'bg-purple-400/20'
        }`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-cyan-600/10' : 'bg-cyan-400/20'
        }`} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <span>Empowering Minds.</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                  Building Futures.
                </span>
              </h1>

              <p className={`mt-6 text-lg max-w-xl leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Xeviqo is a next-generation learning and development platform dedicated to
                empowering learners, developers, and professionals with industry-relevant
                skills, real-world projects, and expert mentorship to excel in the digital world.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/training"
                  className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl px-7 py-3.5 font-bold text-base transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 ${
                    isDark
                      ? "bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-600 text-white hover:border-indigo-400 hover:shadow-[0_0_35px_rgba(99,102,241,0.45)]"
                      : "bg-white border-2 border-slate-300 text-slate-900 hover:border-indigo-500 hover:shadow-[0_10px_35px_rgba(99,102,241,0.20)]"
                  }`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Play size={18} className="relative z-10 transition-all duration-300 group-hover:scale-125 group-hover:text-indigo-400" />
                  <span className="relative z-10 tracking-wide">Know More</span>
                </Link>
              </div>

              {/* Avatar stack + rating */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {studentAvatars.map((s) => (
                    <PhotoWithFallback
                      key={s.name}
                      src={s.image}
                      name={s.name}
                      gradient={s.gradient}
                      className={`w-10 h-10 rounded-full border-2 ${
                        isDark ? 'border-slate-950' : 'border-white'
                      } text-xs`}
                      loading="lazy"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Learn Today. Build Tomorrow.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Orbit Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center order-1 lg:order-2"
            >
              <OrbitVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================= STATS ============================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 rounded-2xl border p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-colors duration-300 ${
            isDark 
              ? 'border-white/10 bg-white/5' 
              : 'border-slate-200/60 bg-white/80'
          }`}
        >
          {statsData.map((stat, i) => {
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                className="text-center relative overflow-hidden group"
              >
                {/* Main Icon with Gradient */}
                <div className={`relative z-10 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg mb-2 sm:mb-3`}>
                  <stat.icon size={18} className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]" />
                </div>
                
                <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold relative z-10 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>{stat.value}</div>
                <div className={`text-[8px] sm:text-[10px] md:text-xs lg:text-sm mt-0.5 sm:mt-1 relative z-10 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>{stat.label}</div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ============================= MISSION & VISION ============================= */}
      <section className={`container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative transition-colors duration-300`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-4 ${
              isDark 
                ? 'border-purple-400/20 bg-purple-500/10 text-purple-300' 
                : 'border-purple-400/30 bg-purple-100/60 text-purple-700'
            }`}>
              <Sparkles size={14} />
              <span>OUR PURPOSE</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Our <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Mission</span> &amp; Vision
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className={`flex-shrink-0 grid h-12 w-12 place-items-center rounded-xl ${
                  isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
                }`}>
                  <Target size={22} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Our Mission
                  </h3>
                  <p className={`mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    To empower millions of learners with practical skills, real-world
                    experience, and the right guidance to build successful careers in technology.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`flex-shrink-0 grid h-12 w-12 place-items-center rounded-xl ${
                  isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-100 text-sky-600'
                }`}>
                  <Eye size={22} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Our Vision
                  </h3>
                  <p className={`mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    To be the most trusted and innovative learning platform that bridges the
                    gap between education and industry, creating a world of opportunities.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Mission/Vision Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`relative rounded-2xl overflow-hidden border ${
              isDark ? 'border-white/10' : 'border-slate-200/60'
            }`}
          >
            <PhotoWithFallback
              src="/images/our_vision_photo.png"
              name="Xeviqo Mission"
              gradient="from-indigo-600 to-purple-700"
              className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover"
              loading="lazy"
            />
            <div className={`absolute bottom-0 left-0 right-0 p-5 sm:p-6 ${
              isDark ? 'bg-gradient-to-t from-slate-950/90 to-transparent' : 'bg-gradient-to-t from-slate-50/90 to-transparent'
            }`}>
              <div className="text-3xl text-purple-400 leading-none mb-1">&ldquo;</div>
              <p className="text-base sm:text-lg font-semibold leading-relaxed">
                <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                  Learning is not just about
                </span>{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-bold">
                  knowledge
                </span>
                <span className={`${isDark ? "text-white" : "text-slate-900"}`}>
                  , it's about
                </span>{" "}
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 bg-clip-text text-transparent font-bold">
                  building your future.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================= CORE VALUES ============================= */}
      <section className={`py-16 md:py-20 border-y transition-colors duration-300 ${
        isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100/50 border-slate-200/30'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <div className={`inline-flex items-center gap-2 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="text-purple-400">✦</span>
              <span className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Our Core Values
              </span>
              <span className="text-purple-400">✦</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                className={`rounded-xl border p-4 sm:p-5 md:p-6 text-center transition-all duration-300 ${
                  isDark 
                    ? 'border-white/10 bg-white/5 hover:border-indigo-400/30 hover:bg-white/[0.07]' 
                    : 'border-slate-200/60 bg-white/80 hover:border-indigo-300 hover:bg-white'
                }`}
              >
                <div className={`grid h-12 w-12 sm:h-13 sm:w-13 md:h-14 md:w-14 mx-auto place-items-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ${
                  isDark ? 'text-indigo-300' : 'text-indigo-600'
                } mb-3 sm:mb-4`}>
                  <v.icon size={20} className="sm:w-[22px] sm:h-[22px] md:w-[24px] md:h-[24px]" />
                </div>
                <h3 className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {v.title}
                </h3>
                <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= OUR JOURNEY ============================= */}
      <section className={`py-16 md:py-20 transition-colors duration-300 ${
        isDark ? '' : 'bg-slate-50'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <div className={`inline-flex items-center gap-2 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="text-purple-400">✦</span>
              <span className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Our Journey
              </span>
              <span className="text-purple-400">✦</span>
            </div>
          </div>

          <div className="relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-2 left-0 right-0 h-px bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
              {journey.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  <div className={`hidden md:block w-4 h-4 rounded-full ${step.dot} mx-auto mb-4 ring-4 ${
                    isDark ? 'ring-slate-950' : 'ring-white'
                  }`} />
                  <h3 className={`font-bold text-base sm:text-lg ${step.color}`}>
                    {step.title}
                  </h3>
                  <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================= MENTORS ============================= */}
      <section className={`py-16 md:py-20 border-y transition-colors duration-300 ${
        isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-100/50 border-slate-200/30'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Learn From <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Our Mentors</span>
              </h2>
              <p className={`mt-1.5 sm:mt-2 max-w-xl text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Learn from dedicated mentors through practical training, real-time projects,
                and personalized guidance designed to help you succeed in the tech industry.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {mentors.map((mentor, i) => (
                <motion.div
                  key={mentor.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl overflow-hidden border transition-all duration-300 group ${
                    isDark 
                      ? 'border-white/10 bg-white/5 hover:border-indigo-400/30' 
                      : 'border-slate-200/60 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <PhotoWithFallback
                      src={mentor.image}
                      name={mentor.name}
                      gradient={mentor.gradient}
                      className="w-full h-full text-2xl sm:text-3xl group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 ${
                      isDark 
                        ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent' 
                        : 'bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent'
                    }`} />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {mentor.name}
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {mentor.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}