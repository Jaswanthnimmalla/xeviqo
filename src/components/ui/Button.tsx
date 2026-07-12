import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  icon?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function Button({ 
  children, 
  to, 
  href, 
  onClick, 
  variant = 'primary', 
  icon, 
  className = '',
  size = 'md',
  fullWidth = false
}: ButtonProps) {
  // Base classes with responsive sizing
  const sizeClasses = {
    sm: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm',
    md: 'px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base',
    lg: 'px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 text-base sm:text-lg'
  }

  // Width classes
  const widthClass = fullWidth ? 'w-full sm:w-auto' : ''

  // Base button classes with responsive styling
  const baseClasses = variant === 'primary' 
    ? 'btn-primary inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95' 
    : 'btn-ghost inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95'
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${widthClass} ${className}`

  // Icon wrapper with responsive sizing
  const iconElement = icon && (
    <span className="flex-shrink-0">
      {icon}
    </span>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
        {iconElement}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {iconElement}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
      {iconElement}
    </button>
  )
}