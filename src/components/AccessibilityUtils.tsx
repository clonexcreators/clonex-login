// CloneX Accessibility Utilities - Phase 2.5
// WCAG 2.1 AA compliant components and hooks

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Screen Reader Only Text
 * 
 * Visually hidden but accessible to screen readers
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
)

/**
 * Skip to Content Link
 * 
 * Allows keyboard users to skip navigation
 */
export const SkipToContent: React.FC<{ targetId?: string }> = ({ targetId = 'main-content' }) => {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white 
        focus:rounded-lg focus:shadow-lg
      "
    >
      Skip to main content
    </a>
  )
}

/**
 * Focus Trap
 * 
 * Traps keyboard focus within a container (useful for modals)
 */
interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, active = true }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [active])

  return (
    <div ref={containerRef} role="dialog" aria-modal={active ? 'true' : undefined}>
      {children}
    </div>
  )
}

/**
 * Accessible Button
 * 
 * Button with proper ARIA attributes and keyboard support
 */
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
  className?: string
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  ariaLabel,
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-lg font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}

/**
 * Live Region
 * 
 * Announces dynamic content changes to screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  className?: string
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  className = ''
}) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={className}
    >
      {children}
    </div>
  )
}

/**
 * Progress Bar
 * 
 * Accessible progress indicator
 */
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color = '#3B82F6',
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/**
 * Keyboard Shortcut Indicator
 * 
 * Shows keyboard shortcuts in a visually consistent way
 */
interface KeyboardShortcutProps {
  keys: string[]
  description: string
}

export const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
      <span className="text-sm text-gray-700">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-gray-400 mx-1">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * Color Contrast Checker Hook
 * 
 * Ensures text meets WCAG 2.1 AA standards
 */
export const useColorContrast = (foreground: string, background: string): {
  ratio: number
  meetsAA: boolean
  meetsAAA: boolean
} => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7
  }
}

/**
 * Reduced Motion Wrapper
 * 
 * Respects user's prefers-reduced-motion setting
 */
interface ReducedMotionWrapperProps {
  children: React.ReactNode
  reducedContent?: React.ReactNode
}

export const ReducedMotionWrapper: React.FC<ReducedMotionWrapperProps> = ({
  children,
  reducedContent
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion && reducedContent ? <>{reducedContent}</> : <>{children}</>
}

/**
 * Tooltip
 * 
 * Accessible tooltip with keyboard support
 */
interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const tooltipId = React.useId()

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div aria-describedby={isVisible ? tooltipId : undefined}>
        {children}
      </div>
      {isVisible && (
        <motion.div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg
            whitespace-nowrap ${positionClasses[position]}
          `}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              [position === 'top' ? 'bottom' : 'top']: '-4px',
              [position === 'left' || position === 'right' ? 'top' : 'left']: '50%',
              transform: 'translateX(-50%) rotate(45deg)'
            }}
          />
        </motion.div>
      )}
    </div>
  )
}
