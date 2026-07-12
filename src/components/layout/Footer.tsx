import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter, Instagram, Mail } from 'lucide-react'

const columns = [
  {
    title: 'Training',
    links: [
      { label: 'Python Training', to: '/training/python' },
      { label: 'Java Training', to: '/training/java' },
      { label: 'All Programs', to: '/training' },
    ],
  },
  {
    title: 'Projects',
    links: [
      { label: 'Final Year Projects', to: '/projects' },
      { label: 'Request a Project', to: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Development Services', to: '/services' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Xeviqo', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line-light dark:border-white/10 bg-surface-lightraised/60 dark:bg-white/[0.02]">
      <div className="container-x py-10 sm:py-12 md:py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8 md:gap-10">
          {/* Brand Column - spans 2 columns */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-base sm:text-lg font-semibold">
              <img src="/logo-mark.png" alt="Xeviqo" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 object-contain drop-shadow-sm" />
              <span className="text-ink dark:text-white">Xeviqo</span>
            </Link>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-ink/60 dark:text-slate-400 max-w-xs leading-relaxed">
              Learn Today. Build Tomorrow. A modern technology company building practical training and
              real-world software solutions.
            </p>
            <div className="mt-4 sm:mt-5 md:mt-6 flex items-center gap-2 sm:gap-3">
              {[Github, Linkedin, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-8 w-8 sm:h-8 sm:w-8 md:h-9 md:w-9 place-items-center rounded-full border border-line-light dark:border-white/15 bg-white dark:bg-transparent shadow-sm text-ink/60 dark:text-slate-300 hover:text-primary hover:border-primary/40 transition-colors"
                  aria-label="Social link"
                >
                  <Icon size={14} className="sm:w-[15px] sm:h-[15px] md:w-[16px] md:h-[16px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs sm:text-sm font-semibold text-ink/80 dark:text-slate-200">
                {col.title}
              </h4>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs sm:text-sm text-ink/60 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 md:mt-14 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-line-light dark:border-white/10 pt-6 sm:pt-7 md:pt-8 text-xs sm:text-sm text-ink/50 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Xeviqo. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <a href="mailto:xeviqo43@gmail.com" className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors">
              <Mail size={12} className="sm:w-[14px] sm:h-[14px]" /> 
              <span className="text-xs sm:text-sm">xeviqo43@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}