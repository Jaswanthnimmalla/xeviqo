import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Smartphone, 
  Monitor, 
  Code2, 
  Shield, 
  Zap,
  Layers,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  GraduationCap,
  Heart,
  Sparkles,
  Briefcase,
  Users,
  Cpu,
  Cloud,
  GitBranch,
  Terminal,
  Database
} from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import CTASection from '../components/home/CTASection'

// Updated project categories
const updatedCategories = [
  'All',
  'Web Applications',
  'Android Apps',
  'Full Stack',
  'AI/ML',
  'E-commerce',
  'Educational',
  'Healthcare',
  'Custom Solutions'
]

// Define project types
type Project = {
  id: string
  title: string
  category: string
  description: string
  features: string[]
  techStack: string[]
  type: 'web' | 'android' | 'fullstack' | 'custom'
  isCustom?: boolean
}

// Updated projects data - removed budget
const updatedProjects: Project[] = [
  {
    id: '1',
    title: 'Smart Inventory Management System',
    category: 'Web Applications',
    description: 'A comprehensive inventory tracking system with real-time stock updates, barcode scanning, and automated reordering.',
    features: [
      'Real-time inventory tracking',
      'Barcode scanning integration',
      'Automated reorder alerts',
      'Multi-user access control',
      'Analytics dashboard'
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    type: 'web'
  },
  {
    id: '2',
    title: 'Fitness & Wellness Android App',
    category: 'Android Apps',
    description: 'Feature-rich fitness app with workout tracking, nutrition planning, progress monitoring, and personalized recommendations.',
    features: [
      'Workout tracking & logging',
      'Nutritional planning',
      'Progress visualization',
      'Push notifications',
      'Social sharing features'
    ],
    techStack: ['Kotlin', 'Firebase', 'Material Design', 'Room Database'],
    type: 'android'
  },
  {
    id: '3',
    title: 'E-Learning Platform',
    category: 'Full Stack',
    description: 'Complete learning management system with video lectures, quizzes, progress tracking, and certification generation.',
    features: [
      'Video content delivery',
      'Interactive quizzes',
      'Progress tracking',
      'Certificate generation',
      'Discussion forums'
    ],
    techStack: ['React', 'Django', 'PostgreSQL', 'AWS S3'],
    type: 'fullstack'
  },
  {
    id: '4',
    title: 'AI-Powered Resume Screener',
    category: 'AI/ML',
    description: 'Intelligent resume screening system that uses NLP to parse, rank, and match candidates with job requirements.',
    features: [
      'NLP resume parsing',
      'Skill extraction & matching',
      'Candidate ranking algorithm',
      'Custom scoring criteria',
      'Interactive dashboard'
    ],
    techStack: ['Python', 'TensorFlow', 'Flask', 'MongoDB'],
    type: 'web'
  },
  {
    id: '5',
    title: 'Healthcare Appointment Booking',
    category: 'Web Applications',
    description: 'Seamless healthcare appointment system with doctor profiles, online booking, video consultation, and prescription management.',
    features: [
      'Doctor scheduling',
      'Online appointment booking',
      'Video consultation integration',
      'Prescription management',
      'Patient portal'
    ],
    techStack: ['React', 'Express.js', 'MySQL', 'WebRTC'],
    type: 'web'
  },
  {
    id: '6',
    title: 'Ride-Sharing Android App',
    category: 'Android Apps',
    description: 'Complete ride-hailing solution with GPS tracking, fare calculation, driver-rider matching, and real-time notifications.',
    features: [
      'Real-time GPS tracking',
      'Smart fare estimation',
      'Driver-rider matching',
      'In-app messaging',
      'Payment integration'
    ],
    techStack: ['Kotlin', 'Google Maps API', 'Firebase', 'Stripe'],
    type: 'android'
  },
  {
    id: '7',
    title: 'E-Commerce Store Builder',
    category: 'E-commerce',
    description: 'Drag-and-drop e-commerce platform with product management, payment processing, analytics, and multi-vendor support.',
    features: [
      'Drag-and-drop builder',
      'Payment gateway integration',
      'Analytics dashboard',
      'Multi-vendor support',
      'Inventory management'
    ],
    techStack: ['Vue.js', 'Laravel', 'MySQL', 'Redis'],
    type: 'web'
  },
  {
    id: '8',
    title: 'Student Collaboration Hub',
    category: 'Educational',
    description: 'Comprehensive student collaboration platform with project management, resource sharing, and real-time communication tools.',
    features: [
      'Project management',
      'Resource library',
      'Real-time chat',
      'Team formation',
      'Assignment submission'
    ],
    techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    type: 'fullstack'
  },
  {
    id: '9',
    title: 'AI Chatbot for Customer Support',
    category: 'AI/ML',
    description: 'Intelligent chatbot solution with NLP, multi-language support, and seamless integration with existing support systems.',
    features: [
      'NLP processing',
      'Multi-language support',
      'Ticket management integration',
      'Analytics & reporting',
      'Custom intent training'
    ],
    techStack: ['Python', 'Rasa', 'Node.js', 'PostgreSQL'],
    type: 'web'
  },
  {
    id: '10',
    title: 'Custom Software Solutions',
    category: 'Custom Solutions',
    description: 'Tailored software solutions built specifically for your requirements. We handle everything from planning to deployment.',
    features: [
      'Custom requirements gathering',
      'End-to-end development',
      'Quality assurance & testing',
      'Deployment & maintenance',
      'Ongoing support'
    ],
    techStack: ['Your Choice', 'React/Angular', 'Node.js/Python', 'Any Database'],
    type: 'custom',
    isCustom: true
  }
]

export default function Projects() {
  const [category, setCategory] = useState<string>('All')

  const filtered = category === 'All' 
    ? updatedProjects 
    : updatedProjects.filter((p) => p.category === category)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Web Applications': Monitor,
      'Android Apps': Smartphone,
      'Full Stack': Layers,
      'AI/ML': Code2,
      'E-commerce': ShoppingBag,
      'Educational': GraduationCap,
      'Healthcare': Heart,
      'Custom Solutions': Sparkles
    }
    return icons[category] || Code2
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      web: { label: 'Web App', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/30 dark:border-blue-400/20' },
      android: { label: 'Android', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200/30 dark:border-green-400/20' },
      fullstack: { label: 'Full Stack', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/30 dark:border-purple-400/20' },
      custom: { label: 'Custom', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/30 dark:border-orange-400/20' }
    }
    return badges[type as keyof typeof badges] || badges.web
  }

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 min-h-screen overflow-x-hidden">
      <section className="container-x section-pad !pt-2 sm:!pt-4 md:!pt-6 relative">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 -left-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary/5 rounded-full blur-3xl -z-10 hidden md:block"></div>
        <div className="absolute bottom-20 -right-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-secondary/5 rounded-full blur-3xl -z-10 hidden md:block"></div>

        <SectionHeading
          eyebrow="Final Year Projects"
          title="Custom Software & Android Solutions"
          description="We build tailored software and Android applications based on your specific requirements. Budget-friendly solutions with professional documentation and expert guidance."
        />

        {/* Stats Banner - Responsive grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 lg:mb-12"
        >
          {[
            { icon: Star, label: 'Training Classes', value: 'Live' },
            { icon: Users, label: 'Final Year Projects', value: 'Ready' },
            { icon: Briefcase, label: 'Web & Apps', value: 'Custom' },
            { icon: Zap, label: 'Starting From', value: '₹999' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-2 sm:p-3 md:p-4 text-center border border-primary/10 dark:border-primary-400/10 hover:border-primary/30 dark:hover:border-primary-400/30 transition-all duration-300"
            >
              <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-ink dark:text-white">{stat.value}</div>
              <div className="text-[8px] sm:text-[10px] md:text-xs text-ink/60 dark:text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Filters - Scrollable on mobile */}
        <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 mb-6 sm:mb-8 md:mb-10 lg:mb-12 overflow-x-auto pb-2 sm:pb-3 md:pb-0 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {updatedCategories.map((cat) => {
            const Icon = cat === 'All' ? Layers : getCategoryIcon(cat)
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`group flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-full px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  category === cat
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/20 scale-105'
                    : 'glass-card border border-line-light/50 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary-400/30 hover:scale-105'
                }`}
              >
                <Icon size={10} className={`sm:w-[12px] sm:h-[12px] md:w-[14px] md:h-[14px] ${category === cat ? 'text-white' : 'text-primary'}`} />
                <span className="hidden xs:inline">{cat}</span>
                <span className="xs:hidden">{cat.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Projects Grid - Responsive columns */}
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {filtered.map((p, i) => {
            const TypeBadge = getTypeBadge(p.type)
            const CategoryIcon = getCategoryIcon(p.category)
            
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 6) * 0.06 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md group-hover:blur-xl`}></div>
                
                {/* Card */}
                <div className="relative glass-card p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col border-2 border-transparent group-hover:border-primary/30 dark:group-hover:border-primary-400/30 transition-all duration-300 shadow-sm hover:shadow-2xl bg-white/90 dark:bg-surface-dark/90 h-full">
                  
                  {/* Category Icon Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-1 sm:p-1.5 md:p-2 rounded-xl bg-primary/5 dark:bg-primary-400/5 border border-primary/10 dark:border-primary-400/10">
                    <CategoryIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-primary dark:text-primary-400" />
                  </div>

                  {/* Type Badge */}
                  <span className={`eyebrow self-start !text-[6px] sm:!text-[7px] md:!text-[8px] lg:!text-[10px] px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-0.5 md:py-1 rounded-full ${TypeBadge.color} border`}>
                    {TypeBadge.label}
                  </span>

                  <h3 className="mt-1.5 sm:mt-2 md:mt-3 font-semibold text-xs sm:text-sm md:text-base lg:text-lg leading-snug text-ink dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {p.title}
                  </h3>

                  <p className="mt-1 sm:mt-1.5 md:mt-2 text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-ink/60 dark:text-slate-400 line-clamp-2">
                    {p.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="mt-1.5 sm:mt-2 md:mt-3 flex flex-wrap gap-0.5 sm:gap-1 md:gap-1.5">
                    {p.techStack.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] px-1 sm:px-1.5 md:px-2 lg:px-2.5 py-0.5 rounded-full bg-ink/5 dark:bg-white/5 text-ink/60 dark:text-slate-400 border border-ink/5 dark:border-white/5">
                        {tech}
                      </span>
                    ))}
                    {p.techStack.length > 3 && (
                      <span className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] px-1 sm:px-1.5 md:px-2 lg:px-2.5 py-0.5 rounded-full bg-primary/5 text-primary dark:text-primary-400 border border-primary/10 dark:border-primary-400/10">
                        +{p.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 space-y-0.5 sm:space-y-0.5 md:space-y-1 flex-grow">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-ink/55 dark:text-slate-400 flex items-start gap-1 sm:gap-1.5 md:gap-2">
                        <span className="mt-0.5 sm:mt-1 h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary shrink-0" /> 
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 flex items-center gap-1.5 sm:gap-2 md:gap-3 text-[9px] sm:text-[10px] md:text-xs lg:text-sm pt-1.5 sm:pt-2 md:pt-3 lg:pt-4 border-t border-ink/5 dark:border-white/5">
                    {p.isCustom ? (
                      <Link 
                        to="/contact" 
                        className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex-1 justify-center group text-[9px] sm:text-[10px] md:text-xs lg:text-sm"
                      >
                        <Sparkles size={10} className="sm:w-[12px] sm:h-[12px] md:w-[14px] md:h-[14px]" />
                        <span className="hidden xs:inline">Get Custom Quote</span>
                        <span className="xs:inline hidden sm:inline md:inline lg:inline">Quote</span>
                        <ArrowRight size={10} className="sm:w-[12px] sm:h-[12px] md:w-[14px] md:h-[14px] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <Link 
                        to="/contact" 
                        className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex-1 justify-center group text-[9px] sm:text-[10px] md:text-xs lg:text-sm"
                      >
                        <FileText size={10} className="sm:w-[12px] sm:h-[12px] md:w-[14px] md:h-[14px]" />
                        <span className="hidden xs:inline">Request Project</span>
                        <span className="xs:inline hidden sm:inline md:inline lg:inline">Request</span>
                        <ArrowRight size={10} className="sm:w-[12px] sm:h-[12px] md:w-[14px] md:h-[14px] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-10 md:py-12 lg:py-16"
          >
            <p className="text-sm sm:text-base text-ink/60 dark:text-slate-400">No projects found in this category.</p>
          </motion.div>
        )}

        {/* Bottom CTA Banner - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 glass-card p-4 sm:p-5 md:p-6 lg:p-8 text-center border border-primary/20 dark:border-primary-400/20 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary-400/5 dark:to-secondary-400/5"
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2 md:mb-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-ink dark:text-white">
              Don't See Your Project?
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-ink/60 dark:text-slate-400 max-w-2xl mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-5 px-2">
            We specialize in building custom software and Android applications tailored to your specific requirements. 
            Tell us your idea, and we'll build it within your budget.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 lg:px-7 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group text-[10px] sm:text-xs md:text-sm lg:text-base"
          >
            <span>Start Your Project Today</span>
            <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px] lg:w-[18px] lg:h-[18px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
      <CTASection />
    </div>
  )
}