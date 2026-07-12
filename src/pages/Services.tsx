import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Shield,
  TrendingUp,
  Rocket,
  Code2,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Layout,
  Users,
  Briefcase,
  Award,
  Zap
} from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import { services } from '../data/services'
import CTASection from '../components/home/CTASection'

export default function ServicesPage() {
  const live = services.filter((s) => s.status === 'live')
  const upcoming = services.filter((s) => s.status === 'coming-soon')

  // Features list
  const features = [
    'Expert guidance from industry professionals',
    'Budget-friendly solutions for students',
    'Real-world project experience',
    'Comprehensive documentation & support',
    'Flexible learning schedules',
    'Career preparation & placement assistance'
  ]

  // What We Offer - Replacing stats
  const offerings = [
    {
      icon: Code2,
      title: 'Custom Software Development',
      description: 'Tailored solutions built with modern technologies to meet your specific requirements.'
    },
    {
      icon: Smartphone,
      title: 'Android App Development',
      description: 'Feature-rich mobile applications for Android platforms with intuitive user experiences.'
    },
    {
      icon: Monitor,
      title: 'Web Application Development',
      description: 'Responsive and scalable web applications using cutting-edge frameworks and tools.'
    },
    {
      icon: Database,
      title: 'Database Design & Management',
      description: 'Efficient database solutions with optimized queries and data structures.'
    },
    {
      icon: Cloud,
      title: 'Cloud Deployment & DevOps',
      description: 'Seamless cloud deployment with CI/CD pipelines and modern DevOps practices.'
    },
    {
      icon: Layout,
      title: 'UI/UX Design',
      description: 'User-centered design with beautiful interfaces and exceptional user experiences.'
    }
  ]

  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent dark:from-primary-400/10 dark:via-secondary-400/5"></div>
        <div className="absolute top-20 -right-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="container-x py-8 sm:py-10 md:py-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink dark:text-white leading-tight">
              Empowering Your{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tech Journey
              </span>
            </h1>
            
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-ink/60 dark:text-slate-400 max-w-2xl mx-auto px-4 sm:px-0">
              From training and project guidance to full-scale development, we provide 
              everything you need to succeed in your technology career.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group text-sm sm:text-base"
              >
                Get Started Now
                <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/projects" 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 glass-card border border-line-light/50 dark:border-white/10 rounded-lg font-semibold hover:border-primary/30 transition-all duration-300 text-sm sm:text-base"
              >
                View Projects
                <Rocket size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Offer Section - Replacing Stats */}
      <section className="container-x relative z-10 -mt-6 sm:-mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-4 sm:p-6 md:p-8 border border-primary/20 dark:border-primary-400/20 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary-400/5 dark:to-secondary-400/5"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30"></div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 dark:bg-primary-400/10 border border-primary/20 dark:border-primary-400/20">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary dark:text-primary-400">What We Offer</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {offerings.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 group cursor-default"
              >
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink dark:text-white">{item.title}</h4>
                  <p className="text-[10px] sm:text-xs text-ink/60 dark:text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Services Section */}
      <section className="container-x section-pad relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="mb-8 sm:mb-10 md:mb-12">
          <SectionHeading
            eyebrow="Our Services"
            title="What we do now, and what we're building toward"
            description="Xeviqo's foundation is training and project guidance. Everything below is the technology company we're becoming."
          />
        </div>

        {/* Available Now Section */}
        <div className="mb-12 sm:mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 dark:bg-green-400/10 border border-green-500/20 dark:border-green-400/20">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 dark:text-green-400" />
              <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">Available Now</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {live.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
                
                <div className="relative glass-card p-4 sm:p-5 md:p-6 border-2 border-transparent group-hover:border-primary/30 dark:group-hover:border-primary-400/30 transition-all duration-300 hover:shadow-2xl bg-white/90 dark:bg-surface-dark/90">
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <s.icon size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  
                  <h3 className="mt-4 sm:mt-5 font-semibold text-base sm:text-lg text-ink dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors">
                    {s.title}
                  </h3>
                  
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="mt-3 sm:mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-secondary/20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-orange-500/10 dark:bg-orange-400/10 border border-orange-500/20 dark:border-orange-400/20">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 dark:text-orange-400" />
              <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">Coming Soon</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-secondary/20"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {upcoming.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                className="group relative opacity-90 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
                
                <div className="relative glass-card p-4 sm:p-5 md:p-6 border-2 border-dashed border-secondary/20 dark:border-secondary-400/20 group-hover:border-secondary/40 dark:group-hover:border-secondary-400/40 transition-all duration-300 hover:shadow-2xl bg-white/80 dark:bg-surface-dark/80">
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10 text-secondary group-hover:scale-110 transition-transform duration-300">
                    <s.icon size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  
                  <h3 className="mt-4 sm:mt-5 font-semibold text-base sm:text-lg text-ink dark:text-white group-hover:text-secondary dark:group-hover:text-secondary-400 transition-colors">
                    {s.title}
                  </h3>
                  
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="mt-3 sm:mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      <Clock size={10} className="sm:w-3 sm:h-3" />
                      In Development
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-14 md:mt-16 glass-card p-6 sm:p-7 md:p-8 border border-primary/20 dark:border-primary-400/20 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary-400/5 dark:to-secondary-400/5"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-ink dark:text-white">
              Why Choose Xeviqo?
            </h3>
            <p className="text-sm sm:text-base text-ink/60 dark:text-slate-400 mt-1.5 sm:mt-2">
              We're committed to your success with these core values
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="mt-0.5 p-1 rounded-full bg-primary/10 dark:bg-primary-400/10 flex-shrink-0">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-ink/80 dark:text-slate-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-14 md:mt-16 text-center px-4 sm:px-0"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary/5 dark:bg-primary-400/5 border border-primary/20 dark:border-primary-400/20 mb-3 sm:mb-4">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-ink/80 dark:text-slate-300">
              Ready to start your tech journey?
            </span>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2 sm:mb-3">
            Let's Build Something Amazing Together
          </h3>
          
          <p className="text-sm sm:text-base text-ink/60 dark:text-slate-400 max-w-2xl mx-auto mb-4 sm:mb-6">
            Whether you need training, project guidance, or custom software development, 
            we're here to help you succeed.
          </p>
          
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group text-sm sm:text-base"
          >
            <span>Get in Touch</span>
            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
      
      <CTASection />
    </div>
  )
}