import { useState, useRef, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, ChevronDown, X, Sparkles, Star, Rocket, Gift, Heart, Award } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string, size: number, rotation: number}>>([])
  const formRef = useRef<HTMLFormElement>(null)

  // Generate celebration particles when thank you appears
  useEffect(() => {
    if (showThankYou) {
      const newParticles = []
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFA500', '#FF69B4', '#00E676', '#7C4DFF', '#00BCD4', '#FF4081', '#FFD54F']
      
      // Reduce particles on mobile for better performance
      const particleCount = window.innerWidth < 640 ? 20 : 50
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 20 + 5,
          rotation: Math.random() * 360
        })
      }
      setParticles(newParticles)
    }
  }, [showThankYou])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitted(true)
    
    if (formRef.current) {
      const formData = new FormData(formRef.current)
      
      try {
        const response = await fetch('https://formsubmit.co/xeviqo43@gmail.com', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          setIsSubmitted(false)
          setShowThankYou(true)
          
          setTimeout(() => {
            setShowThankYou(false)
            if (formRef.current) {
              formRef.current.reset()
            }
          }, 10000)
        }
      } catch (error) {
        console.error('Form submission error:', error)
        setIsSubmitted(false)
      }
    }
  }

  const closeThankYou = () => {
    setShowThankYou(false)
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32">
      <section className="container-x section-pad !pt-4 sm:!pt-6 md:!pt-8">
        <SectionHeading
          eyebrow="Contact"
          title="Let's talk about your next step"
          description="Whether it's enrolling in a program or scoping a final year project — reach out and we'll respond quickly."
        />

        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3 glass-card p-4 sm:p-6 md:p-8 relative">
            <form
              ref={formRef}
              className="space-y-4 sm:space-y-5"
              onSubmit={handleSubmit}
            >
              {/* Hidden Fields */}
              <input type="hidden" name="_captcha" value="false" />
              <input
                type="hidden"
                name="_subject"
                value="New Contact Request from Xeviqo Website"
              />
              <input
                type="hidden"
                name="_template"
                value="table"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs sm:text-sm font-medium">Name</label>
                  <input
                    name="Name"
                    required
                    type="text"
                    placeholder="Your full name"
                    className="field text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium">Email</label>
                  <input
                    name="Email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="field text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs sm:text-sm font-medium">Phone</label>
                  <input
                    name="Phone"
                    required
                    type="tel"
                    placeholder="+91 00000 00000"
                    className="field text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium">
                    Course / Interest
                  </label>

                  <div className="relative">
                    <select
                      name="Course"
                      required
                      defaultValue=""
                      className="field-select text-sm sm:text-base"
                    >
                      <option value="" disabled>
                        Select an option
                      </option>

                      <option>Python Training</option>
                      <option>Java Training</option>
                      <option>Final Year Project</option>
                      <option>Web Development</option>
                      <option>Mobile App Development</option>
                      <option>Other Services</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-ink/40 dark:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium">Message</label>

                <textarea
                  name="Message"
                  required
                  rows={4}
                  placeholder="Tell us what you're looking for"
                  className="field resize-none text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full sm:w-auto text-sm sm:text-base"
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <>
                    <span className="animate-pulse">Sending...</span>
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={16} className="hidden sm:inline" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            <div className="glass-card p-4 sm:p-5 md:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Reach us directly
              </h3>

              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <a
                  href="mailto:xeviqo4@gmail.com"
                  className="flex items-center gap-2 sm:gap-3 text-ink/70 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  <Mail size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="break-all">xeviqo4@gmail.com</span>
                </a>

                <a
                  href="tel:+9184640 17933"
                  className="flex items-center gap-2 sm:gap-3 text-ink/70 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  <Phone size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>+91 84640 17933</span>
                </a>

                <a
                  href="https://wa.me/918464017933"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 text-ink/70 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="sm:w-4 sm:h-4 flex-shrink-0"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.94.56 3.75 1.53 5.28L2 22l4.96-1.61a9.87 9.87 0 0 0 5.08 1.4h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
                  </svg>

                  WhatsApp Us
                </a>

                <span className="flex items-center gap-2 sm:gap-3 text-ink/70 dark:text-slate-300">
                  <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  Remote-first · India
                </span>
              </div>
            </div>

            <div className="glass-card overflow-hidden h-48 sm:h-52 md:h-56">
              <iframe
                title="Xeviqo location"
                className="w-full h-full border-0 opacity-90"
                loading="lazy"
                src="https://www.google.com/maps?q=India&output=embed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Thank You Modal - Optimized for Mobile */}
      {showThankYou && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          {/* Close button - better positioned for mobile */}
          <button
            onClick={closeThankYou}
            className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 text-white/60 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110 z-50 p-1 sm:p-2"
            aria-label="Close"
          >
            <X size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>

          {/* Massive Celebration Blast - Optimized for mobile */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Confetti Rain - Reduced on mobile */}
            {[...Array(window.innerWidth < 640 ? 30 : 80)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute animate-confetti"
                style={{
                  width: Math.random() * 8 + 3 + 'px',
                  height: Math.random() * 5 + 2 + 'px',
                  background: [
                    '#FFD700', '#FF6B6B', '#4ECDC4', '#FFA500', 
                    '#FF69B4', '#00E676', '#7C4DFF', '#00BCD4',
                    '#FF4081', '#FFD54F', '#4FC3F7', '#FF5722',
                    '#8BC34A', '#E040FB', '#FFAB91'
                  ][Math.floor(Math.random() * 15)],
                  left: Math.random() * 100 + '%',
                  top: '-10%',
                  animationDuration: (Math.random() * 2.5 + 1.5) + 's',
                  animationDelay: (Math.random() * 1.5) + 's',
                  transform: `rotate(${Math.random() * 360}deg)`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  display: window.innerWidth < 640 && i > 29 ? 'none' : 'block'
                }}
              />
            ))}

            {/* Firework Explosions - Reduced on mobile */}
            {[...Array(window.innerWidth < 640 ? 6 : 12)].map((_, i) => (
              <div
                key={`firework-${i}`}
                className="absolute animate-firework"
                style={{
                  left: Math.random() * 80 + 10 + '%',
                  top: Math.random() * 60 + 10 + '%',
                  width: '3px',
                  height: '3px',
                  background: [
                    '#FFD700', '#FF6B6B', '#4ECDC4', '#FFA500', '#FF69B4'
                  ][Math.floor(Math.random() * 5)],
                  borderRadius: '50%',
                  animationDuration: (Math.random() * 1.5 + 1) + 's',
                  animationDelay: (Math.random() * 1.5) + 's',
                  boxShadow: '0 0 15px currentColor',
                  color: [
                    '#FFD700', '#FF6B6B', '#4ECDC4', '#FFA500', '#FF69B4'
                  ][Math.floor(Math.random() * 5)],
                  display: window.innerWidth < 640 && i > 5 ? 'none' : 'block'
                }}
              />
            ))}

            {/* Floating Sparkles - Reduced on mobile */}
            {[...Array(window.innerWidth < 640 ? 15 : 30)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute animate-float-sparkle"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  background: '#FFD700',
                  borderRadius: '50%',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDuration: (Math.random() * 2.5 + 1.5) + 's',
                  animationDelay: (Math.random() * 1.5) + 's',
                  boxShadow: window.innerWidth < 640 ? '0 0 10px #FFD700' : '0 0 20px #FFD700, 0 0 40px #FFD700',
                  opacity: 0,
                  display: window.innerWidth < 640 && i > 14 ? 'none' : 'block'
                }}
              />
            ))}

            {/* Rotating Stars - Reduced on mobile */}
            {[...Array(window.innerWidth < 640 ? 4 : 8)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute animate-rotate-star"
                style={{
                  left: Math.random() * 90 + 5 + '%',
                  top: Math.random() * 90 + 5 + '%',
                  animationDuration: (Math.random() * 8 + 8) + 's',
                  animationDelay: (Math.random() * 1.5) + 's',
                  display: window.innerWidth < 640 && i > 3 ? 'none' : 'block'
                }}
              >
                <Star 
                  size={Math.random() * 12 + 8}
                  className="text-yellow-400"
                  fill="#FFD700"
                  opacity={0.6}
                />
              </div>
            ))}
          </div>

          {/* Main Thank You Card - Responsive */}
          <div className="relative z-10 max-w-xs sm:max-w-sm md:max-w-md w-full animate-scale-in">
            <div className="relative">
              {/* Glowing Border Effects - Reduced on mobile */}
              <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-40 sm:opacity-50 animate-pulse" />
              
              {/* Main Card */}
              <div className="relative glass-card p-5 sm:p-6 md:p-8 text-center bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 shadow-2xl rounded-2xl border-2 border-primary/30">
                
                {/* Decorative Corner Accents - Hidden on very small screens */}
                <div className="hidden sm:block absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-primary rounded-tl-lg sm:rounded-tl-xl opacity-60" />
                <div className="hidden sm:block absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-primary rounded-tr-lg sm:rounded-tr-xl opacity-60" />
                <div className="hidden sm:block absolute -bottom-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-primary rounded-bl-lg sm:rounded-bl-xl opacity-60" />
                <div className="hidden sm:block absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-primary rounded-br-lg sm:rounded-br-xl opacity-60" />

                {/* Top Decorative Icons - Smaller on mobile */}
                <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Sparkles size={18} className="sm:w-6 sm:h-6 text-yellow-400 animate-spin-slow" />
                  <Rocket size={18} className="sm:w-6 sm:h-6 text-primary animate-bounce-slow" />
                  <Sparkles size={18} className="sm:w-6 sm:h-6 text-yellow-400 animate-spin-slow" />
                </div>

                {/* Success Icon with Glow - Smaller on mobile */}
                <div className="relative inline-block mb-4 sm:mb-6">
                  <div className="absolute inset-0 animate-ping-slow bg-primary/20 rounded-full" />
                  <div className="absolute inset-[-3px] sm:inset-[-4px] animate-pulse-slow bg-gradient-to-r from-primary via-secondary to-primary rounded-full blur-lg sm:blur-xl opacity-30" />
                  <div className="relative bg-gradient-to-br from-primary to-secondary p-3.5 sm:p-4 md:p-5 rounded-full shadow-2xl shadow-primary/50">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Title with Gradient - Smaller on mobile */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  Thank You! 🎉
                </h3>
                
                {/* Subtitle */}
                <p className="text-base sm:text-lg text-ink/80 dark:text-slate-200 font-medium mb-2 sm:mb-3">
                  We're thrilled to hear from you!
                </p>
                
                {/* Decorative Divider - Hidden on very small screens */}
                <div className="hidden xs:flex relative items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  <Heart size={14} className="sm:w-4 sm:h-4 text-primary animate-pulse" fill="#FF6B6B" />
                  <Award size={14} className="sm:w-4 sm:h-4 text-secondary animate-pulse" />
                  <Heart size={14} className="sm:w-4 sm:h-4 text-primary animate-pulse" fill="#FF6B6B" />
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>

                {/* Message - Smaller on mobile */}
                <p className="text-xs sm:text-sm text-ink/60 dark:text-slate-400 leading-relaxed max-w-xs mx-auto px-1">
                  Our team will get back to you within <strong className="text-primary">24 hours</strong>.
                  We're excited to help you achieve your goals! 🚀
                </p>

                {/* Badges - Smaller on mobile */}
                <div className="mt-3.5 sm:mt-4 md:mt-5 flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-[10px] sm:text-xs font-medium text-primary border border-primary/20 backdrop-blur-sm">
                    ✨ Quick Response
                  </span>
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-full text-[10px] sm:text-xs font-medium text-secondary border border-secondary/20 backdrop-blur-sm">
                    💬 24/7 Support
                  </span>
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-green-400/10 to-emerald-500/10 rounded-full text-[10px] sm:text-xs font-medium text-green-600 border border-green-400/20 backdrop-blur-sm">
                    🎯 Expert Team
                  </span>
                </div>

                {/* Action Buttons - Stack on mobile */}
                <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={closeThankYou}
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:scale-105"
                  >
                    Close
                  </button>
                  <a
                    href="https://wa.me/918464017933"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2 justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.94.56 3.75 1.53 5.28L2 22l4.96-1.61a9.87 9.87 0 0 0 5.08 1.4h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
                      </svg>
                      <span>Chat on WhatsApp</span>
                    </span>
                  </a>
                </div>

                {/* Footer */}
                <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-ink/40 dark:text-slate-500">
                  We'll be in touch soon! 🤝
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* @ts-ignore */}
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0);
            opacity: 0;
          }
        }

        @keyframes firework {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(15) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(30) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes float-sparkle {
          0%, 100% {
            opacity: 0;
            transform: translateY(0) scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.2) rotate(180deg);
          }
        }

        @keyframes rotate-star {
          0% {
            transform: rotate(0deg) scale(0);
            opacity: 0;
          }
          50% {
            transform: rotate(180deg) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg) scale(0);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.5) translateY(30px) rotate(-5deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.02) translateY(-5px) rotate(1deg);
          }
          100% {
            transform: scale(1) translateY(0) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.15);
          }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-confetti {
          animation: confetti 3s ease-in forwards;
        }

        .animate-firework {
          animation: firework 2s ease-out forwards;
        }

        .animate-float-sparkle {
          animation: float-sparkle 2.5s ease-in-out infinite;
        }

        .animate-rotate-star {
          animation: rotate-star 12s linear infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-ping-slow {
          animation: ping-slow 1.5s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* Dark mode glass card override */
        .dark .glass-card {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(20px);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px);
        }

        /* Custom breakpoint for extra small screens */
        @media (min-width: 480px) {
          .xs\\:flex {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}