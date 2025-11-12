// CloneX DNA Badge Component - Phase 2.5 Enhanced with Animations
// Version: 3.6.4 - Framer Motion integration with accessibility

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { DNAType, DNA_THEMES } from '../../theme/dna'

interface DnaBadgeProps {
  type: DNAType
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  className?: string
  animated?: boolean
  interactive?: boolean
  glowEffect?: boolean
}

/**
 * DNA Badge Component - Enhanced with Animations
 * 
 * Features:
 * - Smooth entrance animations
 * - Interactive hover states with scale and glow
 * - Pulse effect for special DNA types (Murakami Drip)
 * - Accessibility: ARIA labels, keyboard navigation
 * - Responsive sizing
 */
export const DnaBadge: React.FC<DnaBadgeProps> = ({
  type,
  size = 'md',
  showLabel = true,
  className = '',
  animated = true,
  interactive = false,
  glowEffect = false
}) => {
  const theme = DNA_THEMES[type]

  if (!theme) {
    console.warn('Invalid DNA type for badge:', type)
    return null
  }

  // Size configurations
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
    xl: 'text-lg px-5 py-2.5 gap-3'
  }

  const iconSizes = {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '28px'
  }

  // Animation variants
  const badgeVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: -10
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.4
      }
    },
    hover: interactive ? {
      scale: 1.05,
      boxShadow: glowEffect ? `0 0 20px ${theme.accent}40` : undefined,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    } : {},
    tap: interactive ? {
      scale: 0.95
    } : {}
  }

  const iconVariants: Variants = {
    initial: {
      rotate: -180,
      opacity: 0
    },
    animate: {
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 0.1
      }
    },
    hover: interactive ? {
      rotate: 5,
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    } : {}
  }

  // Murakami Drip gets special pulse animation
  const isMurakamiDrip = type === 'murakami-drip'
  
  const pulseAnimation = isMurakamiDrip ? {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  } : {}

  const Component = animated ? motion.span : 'span'
  const IconComponent = animated ? motion.img : 'img'

  return (
    <Component
      className={`
        dna-badge inline-flex items-center justify-center rounded-full font-semibold
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer' : ''}
        ${isMurakamiDrip ? 'relative overflow-hidden' : ''}
        ${className}
      `}
      style={{
        backgroundColor: theme.accent,
        color: 'white',
        border: '2px solid rgba(0, 0, 0, 0.1)'
      }}
      variants={animated ? badgeVariants : undefined}
      initial={animated ? 'initial' : undefined}
      animate={animated ? ['animate', pulseAnimation] : undefined}
      whileHover={animated && interactive ? 'hover' : undefined}
      whileTap={animated && interactive ? 'tap' : undefined}
      role="status"
      aria-label={`${theme.name} DNA type`}
      tabIndex={interactive ? 0 : undefined}
    >
      {/* Murakami Drip shimmer effect */}
      {isMurakamiDrip && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            width: '50%'
          }}
        />
      )}

      <IconComponent
        src={theme.icon}
        alt={`${theme.name} DNA icon`}
        className="dna-icon relative z-10"
        style={{
          width: iconSizes[size],
          height: iconSizes[size],
          filter: 'brightness(0) invert(1)' // Make icon white
        }}
        variants={animated ? iconVariants : undefined}
        aria-hidden="true"
      />
      
      {showLabel && (
        <motion.span
          className="relative z-10 whitespace-nowrap"
          initial={animated ? { opacity: 0, x: -5 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: 0.2, duration: 0.3 } : undefined}
        >
          {theme.name}
        </motion.span>
      )}
    </Component>
  )
}

/**
 * DNA Badge Group Component
 * 
 * Displays multiple DNA badges in a responsive grid
 * Perfect for showing available DNA types or collections
 */
interface DnaBadgeGroupProps {
  types: DNAType[]
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabels?: boolean
  onSelect?: (type: DNAType) => void
  selectedType?: DNAType
  className?: string
}

export const DnaBadgeGroup: React.FC<DnaBadgeGroupProps> = ({
  types,
  size = 'md',
  showLabels = true,
  onSelect,
  selectedType,
  className = ''
}) => {
  const containerVariants: Variants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div
      className={`flex flex-wrap gap-2 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      role="group"
      aria-label="DNA type badges"
    >
      {types.map((type) => (
        <motion.div
          key={type}
          onClick={() => onSelect?.(type)}
          whileHover={onSelect ? { y: -2 } : undefined}
          className={`
            ${selectedType === type ? 'ring-2 ring-offset-2 ring-blue-500 rounded-full' : ''}
          `}
        >
          <DnaBadge
            type={type}
            size={size}
            showLabel={showLabels}
            interactive={!!onSelect}
            glowEffect={selectedType === type}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * DNA Badge Tooltip Component
 * 
 * Shows additional DNA information on hover
 */
interface DnaBadgeTooltipProps {
  type: DNAType
  children: React.ReactNode
  description?: string
}

export const DnaBadgeTooltip: React.FC<DnaBadgeTooltipProps> = ({
  type,
  children,
  description
}) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const theme = DNA_THEMES[type]

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <motion.div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-semibold mb-1">{theme.name}</div>
          {description && <div className="text-gray-300">{description}</div>}
          <div className="text-gray-400 text-xs mt-1">
            Accent: {theme.accent}
          </div>
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"
            style={{ marginTop: '-2px' }}
          />
        </motion.div>
      )}
    </div>
  )
}
