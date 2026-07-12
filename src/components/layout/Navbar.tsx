import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Menu, X, Moon, Sun, ArrowRight, 
  Home, GraduationCap, FolderGit2, 
  Briefcase, Info, FileText, Mail, LogIn 
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const navLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Training', to: '/training', icon: GraduationCap },
  { label: 'Projects', to: '/projects', icon: FolderGit2 },
  { label: 'Services', to: '/services', icon: Briefcase },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Blog', to: '/blog', icon: FileText },
  { label: 'Contact', to: '/contact', icon: Mail },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/85 dark:bg-surface-dark/85 backdrop-blur-xl border-line-light dark:border-white/10 shadow-nav py-2.5'
            : 'bg-white/70 dark:bg-surface-dark/70 backdrop-blur-md border-transparent py-4'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 font-display shrink-0 group"
            >
              <div className="relative">
                <img
                  src="/logo-mark.png"
                  alt="Xeviqo logo"
                  className="h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
                Xeviqo
              </span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/training"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                Training
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                Services
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                Blog
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary-400/10 rounded-full'
                      : 'text-ink/70 dark:text-slate-300 hover:text-primary dark:hover:text-primary-400 hover:bg-ink/[0.03] dark:hover:bg-white/5 rounded-full'
                  }`
                }
              >
                Contact
              </NavLink>
            </nav>

            {/* Right side actions - Desktop */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="grid h-9 w-9 place-items-center rounded-full border border-line-light dark:border-white/15 bg-white dark:bg-transparent shadow-sm text-ink dark:text-white hover:border-primary/50 transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <LogIn size={16} />
                Login
              </Link>
            </div>

            {/* Mobile actions - REMOVED login icon from here */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="grid h-9 w-9 place-items-center rounded-full border border-line-light dark:border-white/15 bg-white dark:bg-transparent"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {/* Login button removed from mobile navbar */}
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-full border border-line-light dark:border-white/15 bg-white dark:bg-transparent hover:border-primary/50 transition-colors"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu - Fixed to show login button clearly */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] lg:hidden overflow-y-auto"
            style={{
              background: theme === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            <div className="min-h-screen flex flex-col">
              <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Link 
                    to="/" 
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 font-display group"
                  >
                    <img 
                      src="/logo-mark.png" 
                      alt="Xeviqo logo" 
                      className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-xl" 
                    />
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
                      Xeviqo
                    </span>
                  </Link>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full border border-ink/10 dark:border-white/15 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <motion.nav
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-1 flex-1 overflow-y-auto pb-4"
              >
                {navLinks.map((link, index) => {
                  const Icon = link.icon
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.1 + index * 0.06,
                        type: 'spring',
                        stiffness: 400,
                        damping: 30
                      }}
                    >
                      <NavLink
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-xl font-medium transition-all duration-200 ${
                            isActive 
                              ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary-400/20 dark:to-primary-400/10 text-primary dark:text-primary-400 shadow-lg shadow-primary/5' 
                              : 'text-ink dark:text-slate-200 hover:bg-ink/5 dark:hover:bg-white/5 hover:translate-x-2'
                          }`
                        }
                      >
                        <span className="flex items-center gap-3 sm:gap-4">
                          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 dark:bg-primary-400/10 flex items-center justify-center text-primary dark:text-primary-400 flex-shrink-0">
                            <Icon size={18} className="sm:w-5 sm:h-5" />
                          </span>
                          {link.label}
                          {link.to === '/' && (
                            <span className="ml-auto text-xs px-2 sm:px-3 py-1 rounded-full bg-primary/10 dark:bg-primary-400/10 text-primary dark:text-primary-400 font-medium">
                              Home
                            </span>
                          )}
                        </span>
                      </NavLink>
                    </motion.div>
                  )
                })}

                {/* Mobile Menu - Login Button - Made more prominent and visible */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  className="mt-3 sm:mt-4 flex-shrink-0"
                >
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 sm:gap-3 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <LogIn size={18} className="sm:w-5 sm:h-5" />
                    <span>Login to Your Account</span>
                    <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-ink/10 dark:border-white/10 flex-shrink-0"
                >
                  <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-ink/60 dark:text-slate-400 flex-wrap">
                    <Link to="/privacy" onClick={() => setOpen(false)} className="hover:text-primary dark:hover:text-primary-400 transition-colors">Privacy</Link>
                    <span className="w-px h-3 sm:h-4 bg-ink/10 dark:bg-white/10"></span>
                    <Link to="/terms" onClick={() => setOpen(false)} className="hover:text-primary dark:hover:text-primary-400 transition-colors">Terms</Link>
                    <span className="w-px h-3 sm:h-4 bg-ink/10 dark:bg-white/10"></span>
                    <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-primary dark:hover:text-primary-400 transition-colors">Support</Link>
                  </div>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}