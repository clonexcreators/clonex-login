// CloneX DNA Indicator Component - Phase 2.5
// Lightweight DNA type indicators for headers, cards, and UI elements

import React from 'react'
import { motion } from 'framer-motion'
import { DNAType, DNA_THEMES } from '../../theme/dna'

interface DNAIndicatorProps {
  type: DNAType
  variant?: 'dot' | 'bar' | 'corner' | 'glow'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

/**
 * DNA Indicator Component
 * 
 * Subtle visual indicators that can be placed anywhere in the UI
 * to show the active DNA theme without taking up much space
 */
export const DNAIndicator: React.FC<DNAIndicatorProps> = ({
  type,
  variant = 'dot',
  size = 'md',
  animated = true,
  className = ''
}) => {
  const theme = DNA_THEMES[type]

  if (!theme) return null

  const sizeClasses = {
    dot: {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    },
    bar: {
      xs: 'h-1',
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3'
    },
    corner: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    },
    glow: {
      xs: 'w-8 h-8',
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20'
    }
  }

  if (variant === 'dot') {
    return (
      <motion.div
        className={`rounded-full ${sizeClasses.dot[size]} ${className}`}
        style={{
          backgroundColor: theme.accent,
          boxShadow: `0 0 10px ${theme.accent}40`
        }}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? {
          scale: 1,
          opacity: 1,
          boxShadow: [
            `0 0 10px ${theme.accent}40`,
            `0 0 20px ${theme.accent}60`,
            `0 0 10px ${theme.accent}40`
          ]
        } : undefined}
        transition={animated ? {
          scale: { duration: 0.3, type: 'spring', stiffness: 400 },
          opacity: { duration: 0.3 },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        } : undefined}
        role="presentation"
        aria-label={`${theme.name} DNA indicator`}
      />
    )
  }

  if (variant === 'bar') {
    return (
      <motion.div
        className={`w-full ${sizeClasses.bar[size]} ${className}`}
        style={{
          backgroundColor: theme.accent,
          borderRadius: '2px'
        }}
        initial={animated ? { scaleX: 0, opacity: 0 } : undefined}
        animate={animated ? { scaleX: 1, opacity: 1 } : undefined}
        transition={animated ? {
          duration: 0.6,
          type: 'spring',
          stiffness: 200,
          damping: 20
        } : undefined}
        style={{ transformOrigin: 'left' }}
        role="presentation"
        aria-label={`${theme.name} DNA indicator`}
      />
    )
  }

  if (variant === 'corner') {
    return (
      <motion.div
        className={`absolute top-0 right-0 ${sizeClasses.corner[size]} ${className}`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          backgroundColor: theme.accent
        }}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 0.8 } : undefined}
        transition={animated ? {
          duration: 0.4,
          type: 'spring',
          stiffness: 300
        } : undefined}
        style={{ transformOrigin: 'top right' }}
        role="presentation"
        aria-label={`${theme.name} DNA indicator`}
      />
    )
  }

  if (variant === 'glow') {
    return (
      <motion.div
        className={`absolute inset-0 ${sizeClasses.glow[size]} pointer-events-none ${className}`}
        style={{
          background: `radial-gradient(circle, ${theme.accent}30 0%, transparent 70%)`,
          filter: 'blur(10px)'
        }}
        animate={animated ? {
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95]
        } : undefined}
        transition={animated ? {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        } : undefined}
        role="presentation"
        aria-label={`${theme.name} DNA glow effect`}
      />
    )
  }

  return null
}

/**
 * DNA Themed Container
 * 
 * Wraps content with DNA-themed styling
 */
interface DNAThemedContainerProps {
  type: DNAType
  children: React.ReactNode
  variant?: 'card' | 'banner' | 'section'
  showIndicator?: boolean
  className?: string
}

export const DNAThemedContainer: React.FC<DNAThemedContainerProps> = ({
  type,
  children,
  variant = 'card',
  showIndicator = true,
  className = ''
}) => {
  const theme = DNA_THEMES[type]

  if (!theme) return <div className={className}>{children}</div>

  const variantClasses = {
    card: 'rounded-lg p-6 border-2',
    banner: 'rounded-lg p-4 border-l-4',
    section: 'p-8 border-t-4'
  }

  const variantStyles = {
    card: {
      borderColor: theme.accent,
      background: `linear-gradient(135deg, ${theme.accent}05 0%, transparent 100%)`
    },
    banner: {
      borderLeftColor: theme.accent,
      backgroundColor: `${theme.accent}10`
    },
    section: {
      borderTopColor: theme.accent,
      backgroundColor: `${theme.accent}05`
    }
  }

  return (
    <motion.div
      className={`relative ${variantClasses[variant]} ${className}`}
      style={variantStyles[variant]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {showIndicator && variant === 'card' && (
        <DNAIndicator type={type} variant="corner" size="md" />
      )}
      {children}
    </motion.div>
  )
}

/**
 * DNA Profile Header
 * 
 * Enhanced header with DNA theme integration
 */
interface DNAProfileHeaderProps {
  type: DNAType
  title: string
  subtitle?: string
  icon?: string
  action?: React.ReactNode
}

export const DNAProfileHeader: React.FC<DNAProfileHeaderProps> = ({
  type,
  title,
  subtitle,
  icon,
  action
}) => {
  const theme = DNA_THEMES[type]

  if (!theme) return null

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl p-6 mb-6"
      style={{
        background: `linear-gradient(135deg, ${theme.accent}20 0%, ${theme.accent}05 100%)`,
        border: `2px solid ${theme.accent}40`
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {/* Background glow effect */}
      <DNAIndicator type={type} variant="glow" size="lg" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <motion.img
              src={icon}
              alt={theme.name}
              className="w-16 h-16"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            />
          )}
          <div>
            <motion.h2
              className="text-2xl font-bold text-gray-900"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="text-gray-600 mt-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
        {action && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {action}
          </motion.div>
        )}
      </div>

      {/* DNA type indicator bar */}
      <DNAIndicator type={type} variant="bar" size="sm" className="mt-4" />
    </motion.div>
  )
}
